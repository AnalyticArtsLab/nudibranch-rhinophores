

import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core";

import { generateFaces, renderPoints, roundedCylinder } from "../utils";

export function lamellateMesh(options) {

  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const TIP_PERCENTAGE = options.tipPercentage.value;

  // percentage of the THICKNESS to add for the flare at the base
  const BASE_FLARE_PERCENTAGE = options.baseFlarePercentage.value;

  // how quickly the flare falls off, larger numbers fall off more quickly 4-16 is a good range. Larger values create a single step flare, and smaller values haven't collapsed down enough to meet the cap
  const BASE_FALLOFF = options.baseFalloff.value;
  const STEPS = 15;
  const SHAFT_LENGTH = (1 - TIP_PERCENTAGE) * LENGTH;
  const TIP_LENGTH = LENGTH * TIP_PERCENTAGE;

  // the underlying shaft
  // currently straight, may add a slight curve later
  const path = [];
  path.push(new Vector3(0,0,0));

  // main shaft points
  for (let i = 1; i <= STEPS; i++) {
    let y = (i * SHAFT_LENGTH) / STEPS;
    let x = 0;
    let z = 0;
    path.push(new Vector3(x, y, z));
  }

  const calcThickness = (i) => {

    return  THICKNESS +
    THICKNESS *
      BASE_FLARE_PERCENTAGE *
      (2 - 2 / (1 + Math.exp(-(i / STEPS) * BASE_FALLOFF)))

  };

  const shaftOptions = {
    path,
    radiusFunction: calcThickness,
  };

  const shaftMesh = MeshBuilder.CreateTube(
    "lamellate shaft",
    shaftOptions
  );


  const tipPoints = [];

  // reversed the order of the values so the ball grows from the bottom up
  for (let theta = -Math.PI; theta <= 0; theta += Math.PI / 10) {
    const y = Math.cos(theta) * TIP_LENGTH/2;
    const radius = Math.max(0, Math.sin(theta - Math.PI) - y*0.1) * THICKNESS*2;
    for (let phi = 2 * Math.PI; phi >0; phi -= Math.PI / 10) {

      const x = radius * Math.cos(phi);
     
      const z = Math.min(0.5,radius * Math.sin(phi));
     
      tipPoints.push(new Vector3(x, y, z));
    }
  }

  const tipFaces = generateFaces(tipPoints, 20);
  const tipMesh = renderPoints(
    tipPoints,
    tipFaces,
    "lamellate tip",
    false,
    false
  );

  tipMesh.position.y = SHAFT_LENGTH + TIP_LENGTH/2.1;
// tipMesh.position.x = 2;

  tipMesh.parent = shaftMesh;

  // make the cuff around the base

  const cuff = roundedCylinder(THICKNESS*3, THICKNESS*3, THICKNESS*0.3);
// cuff.position.x = 4
  return shaftMesh;

}

