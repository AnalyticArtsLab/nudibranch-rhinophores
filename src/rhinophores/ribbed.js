import { Vector3, MeshBuilder, Color3 } from "@babylonjs/core";
import { createNoise2D } from "simplex-noise";

/**
 * Creates a rhinophore that has some curve and some ribbing
 * 
 * The curve is the complicated thing here. I break the length down into 190
 * segments (the sum of adding 1 to 19). There are then 20 straight lengths,
 * made up of descending numbers of steps. 
 * 
 * To get the curve, I use a tension parameter that multiplies the angle so that
 * distant points curve in more. 
 * 
 * For the ribbing, I use noise keyed to the position along the shaft. The
 * BUMPINESS factor determines how much noise is added to the radius.
 * 
 * @param {*} options
 * @returns
 */
export function ribbedRhinophoreMesh(options) {
  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const BUMPINESS = options.bumpiness.value;

  const NUM_INTERVALS = 20; // the number of straight sections, could be turned down for performance, but it will affect the curve and the noise
  const NUM_STEPS = NUM_INTERVALS * (NUM_INTERVALS - 1) / 2;

  const NOISE_ZOOM = 0.07; // controls the noise change along the length. This could be turned into an option, but keeping as a magic number for the moment

  const noise2D = createNoise2D();

  const path = [];
  path.push(new Vector3(0, 0, 0));

  const TENSION = options.tension.value;
  const multiplier = 1 + TENSION;

  const startAngle = Math.PI / 15; // this is an arbitrary step angle that works
  let theta = startAngle;
  const step = LENGTH / NUM_STEPS;
  for (let i = 0; i <  NUM_INTERVALS; i++) {
    for (let j = 0; j <  (NUM_INTERVALS - 1) - i; j++) {
      const last = path[path.length - 1];
      const x = step * Math.cos(theta + Math.PI / 2 - startAngle) + last.x;
      const y = step * Math.sin(theta + Math.PI / 2 - startAngle) + last.y;
      const z = 0;

      path.push(new Vector3(x, y, z));
    }
    theta *= multiplier;
  }

  const calcThickness = (i) => {
    return (
      (THICKNESS + noise2D(i * NOISE_ZOOM, i * NOISE_ZOOM) * BUMPINESS) *
      Math.cos(((i / path.length) * Math.PI) / 2)
    );
  };

  const rhinophoreOptions = {
    path,
    radiusFunction: calcThickness,
  };

  const rhinophore = MeshBuilder.CreateTube(
    "ribbed rhinophore",
    rhinophoreOptions
  );

  return rhinophore;
}
