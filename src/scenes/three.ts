import {
    WebGLRenderer,
    Scene,
    AxesHelper,
    sRGBEncoding,
    PCFShadowMap,
    ACESFilmicToneMapping,
    Color,
    AmbientLight,
    DirectionalLight,
    ShaderMaterial,
    Vector2,
    Mesh,
    SphereGeometry,
    MeshToonMaterial,
    PlaneGeometry,
    PerspectiveCamera,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// Shaders
import vertexShader from '/@/shaders/vertex.glsl'
import fragmentShader from '/@/shaders/fragment.glsl'

export class ThreeScene {

    private _scene!: Scene
    private _render!: WebGLRenderer
    private _camera!: PerspectiveCamera
    private _control!: OrbitControls

    constructor(canvas: HTMLCanvasElement) {
        this._initScene(canvas)
    }

    private _initScene(canvas: HTMLCanvasElement): Scene {
        // Scene
        const scene = new Scene()
        scene.background = new Color('#333')

        // Renderer
        const renderer = new WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        })

        // More realistic shadows
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = PCFShadowMap
        renderer.physicallyCorrectLights = true
        renderer.outputEncoding = sRGBEncoding
        renderer.toneMapping = ACESFilmicToneMapping
        renderer.toneMappingExposure = 1

        // Lights
        const ambientLight = new AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new DirectionalLight('#ffffff', 1)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(0.25, 2, 2.25)

        scene.add(directionalLight)

        const sphereMaterial = new ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uFrequency: { value: new Vector2(20, 15) },
            },
            vertexShader,
            fragmentShader,
        })

        const sphere = new Mesh(
            new SphereGeometry(1, 32, 32),
            sphereMaterial,
        )

        sphere.position.set(0, 2, 0)
        sphere.castShadow = true
        scene.add(sphere)

        // const DirectionalLightFolder = gui.addFolder({
        //     title: 'Directional Light',
        // })

        // Object.keys(directionalLight.position).forEach(key => {
        //     DirectionalLightFolder.addInput(
        //         directionalLight.position,
        //         key as keyof THREE.Vector3,
        //         {
        //             min: -100,
        //             max: 100,
        //             step: 1,
        //         },
        //     )
        // })

        const plane = new Mesh(
            new PlaneGeometry(10, 10, 10, 10),
            new MeshToonMaterial({ color: '#444' }),
        )

        plane.rotation.set(-Math.PI / 2, 0, 0)
        plane.receiveShadow = true
        scene.add(plane)

        const camera = new PerspectiveCamera(45, 1)
        camera.position.set(9, 4, 9)
        scene.add(camera)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        this._scene = scene
        this._render = renderer
        this._camera = camera
        this._control = controls

        this.resize()
        return scene
    }

    public resize() {
        this._camera.aspect = window.innerWidth / window.innerHeight
        this._camera.updateProjectionMatrix()

        this._render.setSize(window.innerWidth, window.innerHeight)
        this._render.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    public update() {
        this._control.update()
        this._render.render(this._scene, this._camera)
    }

}