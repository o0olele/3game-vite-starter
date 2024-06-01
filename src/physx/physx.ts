enum PhysXRuntimeMode {
    /** Use webAssembly mode first, if WebAssembly mode is not supported, roll back to JavaScript mode.  */
    Auto,
    /** WebAssembly mode. */
    WebAssembly,
    /** JavaScript mode. */
    JavaScript
  }

export class PhysXPhysics {
    /** @internal PhysX wasm object */
    _physX: any;
    /** @internal PhysX Foundation SDK singleton class */
    _pxFoundation: any;
    /** @internal PhysX physics object */
    _pxPhysics: any;
  
    private _runTimeMode: PhysXRuntimeMode;
    private _initializeState: InitializeState = InitializeState.Uninitialized;
    private _initializePromise: Promise<void> | undefined;
  
    constructor(runtimeMode: PhysXRuntimeMode = PhysXRuntimeMode.Auto) {
      this._runTimeMode = runtimeMode;
    }
  
    /**
     * Initialize PhysXPhysics.
     * @param runtimeMode - Runtime mode
     * @returns Promise object
     */
    initialize(): Promise<void> | undefined {
      if (this._initializeState === InitializeState.Initialized) {
        return Promise.resolve();
      } else if (this._initializeState === InitializeState.Initializing) {
        return this._initializePromise;
      }
  
      let runtimeMode = this._runTimeMode;
      const scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        document.body.appendChild(script);
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        if (runtimeMode == PhysXRuntimeMode.Auto) {
          const supported = (() => {
            try {
              if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                  return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
              }
            } catch (e) {}
            return false;
          })();
          if (supported) {
            runtimeMode = PhysXRuntimeMode.WebAssembly;
          } else {
            runtimeMode = PhysXRuntimeMode.JavaScript;
          }
        }
  
        if (runtimeMode == PhysXRuntimeMode.JavaScript) {
          script.src = `https://mdn.alipayobjects.com/rms/afts/file/A*rnDeR58NNGoAAAAAAAAAAAAAARQnAQ/physx.release.js.js`;
        } else if (runtimeMode == PhysXRuntimeMode.WebAssembly) {
          script.src = `https://mdn.alipayobjects.com/rms/afts/file/A*nA97QLQehRMAAAAAAAAAAAAAARQnAQ/physx.release.js`;
        }
      });
  
      const initializePromise = new Promise<void>((resolve, reject) => {
        scriptPromise
          .then(
            () =>
              (<any>window).PHYSX().then((PHYSX: any) => {
                this._init(PHYSX);
                this._initializeState = InitializeState.Initialized;
                this._initializePromise = undefined;
                console.log("PhysX loaded.");
                resolve();
              }, reject),
            reject
          )
          .catch(reject);
      });
  
      this._initializePromise = initializePromise;
      return initializePromise;
    }
  
    /**
     * Destroy PhysXPhysics.
     */
    public destroy(): void {
      this._physX.PxCloseExtensions();
      this._pxPhysics.release();
      this._pxFoundation.release();
      this._physX = null;
      this._pxFoundation = null;
      this._pxPhysics = null;
    }


  
    private _init(physX: any): void {
      const version = physX.PX_PHYSICS_VERSION;
      const defaultErrorCallback = new physX.PxDefaultErrorCallback();
      const allocator = new physX.PxDefaultAllocator();
      const pxFoundation = physX.PxCreateFoundation(version, allocator, defaultErrorCallback);
      const pxPhysics = physX.PxCreatePhysics(version, pxFoundation, new physX.PxTolerancesScale(), false, null);
  
      physX.PxInitExtensions(pxPhysics, null);
      this._physX = physX;
      this._pxFoundation = pxFoundation;
      this._pxPhysics = pxPhysics;
    }
  }
  
  enum InitializeState {
    Uninitialized,
    Initializing,
    Initialized
  }