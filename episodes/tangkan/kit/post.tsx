// Post-processing that works under Remotion's ThreeCanvas: the composer is built synchronously and renders in a
// priority-1 useFrame, so the single `advance()` Remotion calls per frame already draws depth of field + bloom.
// (@react-three/postprocessing's <EffectComposer> builds its passes after that advance and renders a blank frame.)
import { useFrame, useThree } from "@react-three/fiber";
import { BloomEffect, DepthOfFieldEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const Post = ({ focus, range = 2.4, bokeh = 3.2, bloom = 0.75 }: { focus: [number, number, number]; range?: number; bokeh?: number; bloom?: number }) => {
  const { gl, scene, camera, size } = useThree();
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType, multisampling: 4 });
    composer.addPass(new RenderPass(scene, camera));
    const dof = new DepthOfFieldEffect(camera, { focusDistance: 4, focusRange: range, bokehScale: bokeh, resolutionScale: 0.5 });
    const glow = new BloomEffect({ intensity: bloom, luminanceThreshold: 0.8, luminanceSmoothing: 0.2, mipmapBlur: true });
    composer.addPass(new EffectPass(camera, dof));
    composer.addPass(new EffectPass(camera, glow, new VignetteEffect({ darkness: 0.5, offset: 0.25 }), new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })));
    composer.setSize(size.width, size.height);
    return { composer, dof };
  }, [gl, scene, camera, size.width, size.height]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => fx.composer.dispose(), [fx]);
  fx.dof.target = new THREE.Vector3(...focus);
  useFrame((_, delta) => fx.composer.render(delta), 1);
  return null;
};
