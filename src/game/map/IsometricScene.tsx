import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TownState } from '../types';
import { getFootprint } from '../util/footprint';
import { TopDownMap } from './TopDownMap';

type Props = {
  state: TownState;
  tileSize?: number;
  height?: number;
};

const buildingColors: Record<string, string> = {
  town_hall: '#a8b1c7', // gri / şato tonu
  farm: '#7fb278', // yeşil-kahverengi tarla
  sawmill: '#6b4b32', // koyu kahverengi ahşap
  mine: '#c8ced6', // silver / metalik gri
  market: '#d9975b', // sıcak pazar tonu
  decor: '#cfd4de',
};

export const IsometricScene: React.FC<Props> = ({ state, tileSize = 16, height = 360 }) => {
  // Expo GLView web desteği zayıf; web’de 2D fallback gösteriyoruz.
  if (Platform.OS === 'web') {
    return <TopDownMap state={state} tileSize={46} />;
  }

  const scheme = useColorScheme() ?? 'dark';
  const palette = useMemo(
    () =>
      scheme === 'dark'
        ? {
            fog: '#0b1220',
            ground: '#0f2236',
            grid: '#1c3753',
            sky: '#050910',
            shadow: '#02060d',
          }
        : {
            fog: '#dfeaf6',
            ground: '#dfe9f7',
            grid: '#c3d6ed',
            sky: '#eef3f8',
            shadow: '#d0d8e6',
          },
    [scheme],
  );

  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number>();

  const worldSize = useMemo(
    () => ({
      width: state.map.width * tileSize,
      height: state.map.height * tileSize,
    }),
    [state.map.width, state.map.height, tileSize],
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  const rebuildBuildings = (scene: THREE.Scene) => {
    if (buildingsGroupRef.current) {
      buildingsGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
        if ((child as THREE.Mesh).material) {
          const material = (child as THREE.Mesh).material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else {
            material.dispose();
          }
        }
      });
      scene.remove(buildingsGroupRef.current);
    }

    const group = new THREE.Group();
    state.buildings.forEach((b) => {
      const footprint = b.footprint ?? getFootprint(b.type);
      const sizeX = footprint.width * tileSize;
      const sizeZ = footprint.height * tileSize;
      const heightY = tileSize * 1.2 + b.level * 1.4;

      const baseGeo = new THREE.PlaneGeometry(sizeX * 1.05, sizeZ * 1.05);
      const baseMat = new THREE.MeshStandardMaterial({
        color: scheme === 'dark' ? '#0f1f33' : '#a8c4e6',
        transparent: true,
        opacity: scheme === 'dark' ? 0.28 : 0.18,
        roughness: 0.9,
        flatShading: true,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.rotation.x = -Math.PI / 2;
      base.receiveShadow = true;

      const geometry = new THREE.BoxGeometry(sizeX, heightY, sizeZ);
      const color = buildingColors[b.type] ?? '#7aa0c4';
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: scheme === 'dark' ? 0.55 : 0.5,
        metalness: 0.04,
        flatShading: true,
        emissive: new THREE.Color(color).multiplyScalar(scheme === 'dark' ? 0.08 : 0.05),
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const centerX = (b.x + footprint.width / 2 - state.map.width / 2) * tileSize;
      const centerZ = (b.y + footprint.height / 2 - state.map.height / 2) * tileSize;
      mesh.position.set(centerX, heightY / 2, centerZ);
      mesh.scale.setScalar(0.94);
      base.position.set(centerX, 0.02, centerZ);

      const outlineGeo = new THREE.BoxGeometry(sizeX * 1.02, heightY * 1.02, sizeZ * 1.02);
      const outlineMat = new THREE.MeshBasicMaterial({
        color: scheme === 'dark' ? '#9fc7ff' : '#285f9c',
        transparent: true,
        opacity: scheme === 'dark' ? 0.12 : 0.1,
      });
      const outline = new THREE.Mesh(outlineGeo, outlineMat);
      outline.position.copy(mesh.position);
      outline.scale.setScalar(1.02);

      group.add(base);
      group.add(outline);
      group.add(mesh);
    });

    buildingsGroupRef.current = group;
    scene.add(group);
  };

  const setupScene = (gl: ExpoWebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const heightPx = gl.drawingBufferHeight;
    const renderer = new Renderer({ gl });
    renderer.setSize(width, heightPx);
    renderer.setClearColor(palette.sky);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(palette.fog, worldSize.width * 0.6, worldSize.width * 1.8);

    const aspect = width / heightPx;
    const viewSize = Math.max(worldSize.width, worldSize.height) * 1.6;
    const camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      2000,
    );
    const distance = Math.max(worldSize.width, worldSize.height) * 1.4;
    camera.position.set(distance, distance * 0.7, distance);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight('#dfe7f5', scheme === 'dark' ? 0.62 : 0.78);
    const dirLight = new THREE.DirectionalLight('#ffffff', scheme === 'dark' ? 1.05 : 1.2);
    dirLight.position.set(distance, distance * 1.4, distance * 0.2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = distance * 2;

    const hemi = new THREE.HemisphereLight('#dbe7ff', palette.shadow, 0.5);

    scene.add(ambient);
    scene.add(dirLight);
    scene.add(hemi);

    const groundGeo = new THREE.PlaneGeometry(worldSize.width * 1.2, worldSize.height * 1.2, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({
      color: palette.ground,
      roughness: 0.9,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(worldSize.width, state.map.width, palette.grid, palette.grid);
    grid.position.y = 0.05;
    scene.add(grid);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    rebuildBuildings(scene);

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  useEffect(() => {
    if (!sceneRef.current) return;
    rebuildBuildings(sceneRef.current);
  }, [state, tileSize, worldSize.width, worldSize.height]);

  return <GLView style={[styles.canvas, { height }]} onContextCreate={setupScene} />;
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
  },
});
