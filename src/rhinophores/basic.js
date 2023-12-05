import { Vector3, MeshBuilder } from "@babylonjs/core";
import {createNoise2D } from "simplex-noise";


export function simpleRhinophoreMesh(options) {
  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const TIP_PERCENTAGE = options.tipPercentage.value;

  // percentage of the THICKNESS to add for the flare at the base
  const BASE_FLARE_PERCENTAGE = options.baseFlarePercentage.value;

  // how quickly the flare falls off, larger numbers fall off more quickly 4-16 is a good range. Larger values create a single step flare, and smaller values haven't collapsed down enough to meet the cap
  const BASE_FALLOFF = options.baseFalloff.value;
  const STEPS = 15;
  const SHAFT_LENGTH = (1 - TIP_PERCENTAGE) * LENGTH;
  const NOISE_FACTOR = options.shaftNoiseFactor.value;


  const noise2D = createNoise2D();

  const path = [];
  path.push(new Vector3(0,0,0));

  // main shaft points
  for (let i = 1; i <= STEPS; i++) {
    let y = (i * SHAFT_LENGTH) / STEPS;
    let x = (i < 2)? 0:noise2D((i / STEPS), 0)  * THICKNESS * NOISE_FACTOR;
    let z = (i < 2)? 0:noise2D(0, (i / STEPS))  * THICKNESS * NOISE_FACTOR;
    path.push(new Vector3(x, y, z));
  }

  const base = path[STEPS]; // the last point in the shaft
  const direction = path[STEPS].subtract(path[STEPS - 1]).normalize();
  // end cap points
  for (let i = 1; i <= STEPS; i++) {
    const percentage = i / STEPS;
    const alpha = (percentage * Math.PI) / 2;
    const scale = Math.sin(alpha) * LENGTH * TIP_PERCENTAGE;
    path.push(base.add(direction.scale(scale)));
  }

  const calcThickness = (i) => {
    if (i < 2){
      return (
        THICKNESS +
        1.75* THICKNESS *
          BASE_FLARE_PERCENTAGE *
          (2 - 2 / (1 + Math.exp(-(i / STEPS) * BASE_FALLOFF)))
      );
    }else if(i <= STEPS) {
      return (
        THICKNESS +
        THICKNESS *
          BASE_FLARE_PERCENTAGE *
          (2 - 2 / (1 + Math.exp(-(i / STEPS) * BASE_FALLOFF)))
      );
    } else {
      const tipPercentage = (i - STEPS) / STEPS;

      const theta = (tipPercentage * Math.PI) / 2;
      const radius = THICKNESS * Math.cos(theta);
      return radius;
    }
  };

  const rhinophoreOptions = {
    path,
    radiusFunction: calcThickness,
  };

  const rhinophore = MeshBuilder.CreateTube(
    "simple rhinophore",
    rhinophoreOptions
  );

  return rhinophore;
}