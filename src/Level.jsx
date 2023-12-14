import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF, MeshTransmissionMaterial } from '@react-three/drei'

/* We use the same geometry for the all level for performance resaons */
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

/* Pre setting the geometries to re use */
const floorMaterial = new THREE.MeshBasicMaterial({ color: '#242629'})

const wallMaterial = new THREE.MeshStandardMaterial({ color: '#A6AEC2' })

const obstacleColor = [1.5, 0.4, 0.2]

function BlockStart({ position = [0, 0, 0] }) {
    return <group position={position}>
        <Float floatIntensity={0.45} rotationIntensity={0.45}>
            <Text
                font="./bebas-neue-v9-latin-regular.woff"
                scale={0.5}
                maxWidth={0.25}
                lineHeight={0.75}
                textAlign='right'
                position={[0.75, 0.65, 0]}
                rotation-y={- 0.25}
            >
                Marble Race
                <meshBasicMaterial toneMapped={false} color={[ 1.6, 1, 1 ]} />
            </Text>
        </Float>
        <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            position={[0, - 0.1, 0]}
            scale={[4, 0.2, 4]}
        />
    </group>
}

export function BlockSpinner({ position = [0, 0, 0] }) {
    const obstacle = useRef()
    /* Use speed as state to avoid it being changed if component is rerender */
    const [speed] = useState(() => (Math.random() + 0.2) * (Math.random() > 0.5 ? 1 : - 1))

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
        obstacle.current.setNextKinematicRotation(rotation)

    })

    return <group position={position}>
        {/* Floor */}
        <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            position={[0, - 0.1, 0]}
            scale={[4, 0.2, 4]}
        />
        {/* Obstacle */}
        <RigidBody
            ref={obstacle}
            type="kinematicPosition"
            position={[0, 0.3, 0]}
            restitution={0.2}
            friction={0}
        >
            <mesh
                geometry={boxGeometry}
                scale={[3.5, 0.3, 0.3]}
            >
                <MeshTransmissionMaterial
                    transmission={0.6}
                    thickness={0.7}
                    roughness={0.1}
                    color={obstacleColor}
                />
            </mesh>
        </RigidBody>
    </group>
}

export function BlockLimbo({ position = [0, 0, 0] }) {
    const obstacle = useRef()
    /* Use timeOffset as state to avoid it being changed if component is rerender */
    const [timeOffset] = useState(() => Math.random() * 2 * Math.PI)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time + timeOffset) + 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] })

    })

    return <group position={position}>
        {/* Floor */}
        <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            position={[0, - 0.1, 0]}
            scale={[4, 0.2, 4]}
        />
        {/* Obstacle */}
        <RigidBody
            ref={obstacle}
            type="kinematicPosition"
            position={[0, 0.3, 0]}
            restitution={0.2}
            friction={0}
        >
            <mesh
                geometry={boxGeometry}
                scale={[3.5, 0.3, 0.3]}
            >
                <MeshTransmissionMaterial
                    transmission={0.6}
                    thickness={0.7}
                    roughness={0.1}
                    color={obstacleColor}
                />
            </mesh>
        </RigidBody>
    </group>
}

export function BlockSlider({ position = [0, 0, 0] }) {
    const obstacle = useRef()
    /* Use timeOffset as state to avoid it being changed if component is rerender */
    const [timeOffset] = useState(() => Math.random() * 2 * Math.PI)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        const x = Math.sin(time + timeOffset) * 1.25
        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] })

    })

    return <group position={position}>
        {/* Floor */}
        <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            position={[0, - 0.1, 0]}
            scale={[4, 0.2, 4]}
        />
        {/* Obstacle */}
        <RigidBody
            ref={obstacle}
            type="kinematicPosition"
            position={[0, 0.3, 0]}
            restitution={0.2}
            friction={0}
        >
            <mesh
                geometry={boxGeometry}
                scale={[1.5, 1.5, 0.3]}
            >
                <MeshTransmissionMaterial
                    transmission={0.6}
                    thickness={0.7}
                    roughness={0.1}
                    color={obstacleColor}
                />
            </mesh>
        </RigidBody>
    </group>
}

function BlockEnd({ position = [0, 0, 0] }) {
    const hamburger = useGLTF('/hamburger.glb')

    return <group position={position}>
        <Text
            font="./bebas-neue-v9-latin-regular.woff"
            scale={1}
            position={[0, 2.25, 2]}
        >
            Finish
            <meshBasicMaterial toneMapped={false} />
        </Text>
        <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            position={[0, - 0.1, 0]}
            scale={[4, 0.2, 4]}
        />
        <RigidBody
            type="fixed"
            colliders="hull"
            position={[0, 0.25, 0]}
            restitution={0.2}
            friction={0}
        >
            <primitive
                object={hamburger.scene}
                scale={0.2}
            />
        </RigidBody>
    </group>
}

function Bounds({ length = 1 }) {
    return <>
        <RigidBody type="fixed" restitution={0.2} friction={0}>
            <mesh
                position={[2.15, 0.75, -(length * 2) + 2]}
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[0.3, 1.5, length * 4]}
            />
            <mesh
                position={[- 2.15, 0.75, -(length * 2) + 2]}
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[0.3, 1.5, length * 4]}
            />
            <mesh
                position={[0, 0.75, -(length * 4) + 2]}
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[4, 1.5, 0.3]}
            />
            {/* Collider for the floor */}
            <CuboidCollider
                args={[2, 0.1, 2 * length]}
                position={[0, - 0.1, - (length * 2) + 2]}
                restitution={0.2}
                friction={1}
            />
        </RigidBody>
    </>
}

export function Level({ count = 5, types = [BlockSpinner, BlockLimbo, BlockSlider], seed = 0 }) {

    /* Create a random list of obstacles */
    const blocks = useMemo(() => {
        const blocks = []

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            blocks.push(type)
        }

        return blocks
        /* useMemo will be recalcul if count or types change */
    }, [count, types])

    return <>
        <BlockStart position={[0, 0, 0]} />

        {/* Loop on blocks */}
        {blocks.map((Block, index) =>
            <Block key={index}
                position={[0, 0, - (index + 1) * 4]}
            />
        )}

        <BlockEnd position={[0, 0, - (count + 1) * 4]} />

        <Bounds length={count + 2} />
    </>
}