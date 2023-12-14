import { useRapier, RigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import useGame from './stores/useGame.jsx'

export default function Player() {
    const body = useRef()
    const [subscribeKeys, getKeys] = useKeyboardControls()

    /* We retrieve start and end methods fom the store */
    const start = useGame((state) => state.start)
    const end = useGame((state) => state.end)
    const restart = useGame((state) => state.restart)
    const blocksCount = useGame((state) => state.blocksCount)

    //  We can access to the rapier library usiong useRapier
    const { rapier, world } = useRapier()

    // We set the initial camera position and target
    const [smoothedCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10))
    const [smoothedCameraTarget] = useState(() => new THREE.Vector3())

    const jump = () => {
        // We will cast a ray to determine is the ball is low enough to jump
        // To avoid multiple jumps

        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: -1, z: 0 }

        const ray = new rapier.Ray(origin, direction)
        // The true consider everuthing as solid. So it does not wait the border of the floor to collide
        const hit = world.castRay(ray, 10, true)

        /* We jump is the ball is low enough */
        if (hit.toi < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
        }
    }

    const reset = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

    useEffect(() => {
        /* The subscribeKeys return a function to unsubscribe */
        const unsubsribeJump = subscribeKeys(
            /* Selector, we set what we want to listen */
            (state) => state.jump,
            /* The function we call when the action we listen appears */
            (value) => {
                if (value) {
                    jump()
                }
            }
        )

        const unsubscribeAny = subscribeKeys(
            () => {
                start()
            }
        )

        /* We subscribe to state changes */
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'ready') {
                    reset()
                }
            }
        )

        // We unsubscribe when the component is unmounted to clean
        return () => {
            unsubsribeJump()
            unsubscribeAny()
            unsubscribeReset()
        }
    }, [])

    useFrame((state, delta) => {

        // Controls
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        if (forward) {
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }

        if (backward) {
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }

        if (leftward) {
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }

        if (rightward) {
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        // Camera
        // We want to follow the ball
        const bodyPosition = body.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 3
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        // We smooth the camera movement with the lerp function
        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        /**
         * Phases
         */
        /* We check if we reach the end block */
        if (bodyPosition.z < - (blocksCount * 4 + 2)) {
            end()
        }

        /* Check if the ball is falling */
        if (bodyPosition.y < -4) {
            restart()
        }
    })

    return <RigidBody
        ref={body}
        canSleep={false}
        position-y={1}
        colliders="ball"
        restitution={0.2}
        friction={1}
        /* Dampings allow the ball to stop when we stop apllying force on it */
        linearDamping={0.5}
        angularDamping={0.5}
    >
        <mesh castShadow>
            <icosahedronGeometry args={[0.3, 1]} />
            {/* Flatshading allow to see better the surface rotate */}
            <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
    </RigidBody>
}