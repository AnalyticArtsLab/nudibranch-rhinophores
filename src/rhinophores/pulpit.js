import { Vector3 } from "@babylonjs/core";
import { createNoise3D, createNoise2D } from "simplex-noise";

import { generateFaces, renderPoints } from "../utils";
import { simpleRhinophoreMesh } from "./basic";

export function pulpitMesh(options) {
  const PULPIT_LENGTH =
    options.length.value * options.pulpitLengthPercentage.value;
  const THICKNESS = options.pulpitThickness.value;
  const BOTTOM_THICKNESS = THICKNESS * options.baseRadiusPercentage.value;
  // zoom factor on x and z for the noise controlling the radius of the pulpit
  // large values cause more offsets around the circle
  const HORIZONTAL_NOISE_ZOOM = options.horizontalNoiseZoom.value;

  // zoom factor on y for the noise controlling the radius of the pulpit
  // large values cause more variation as we go up the pulpit
  const VERTICAL_NOISE_ZOOM = options.verticalNoiseZoom.value;

  // the amount of noise to add to the radius
  // larger values cause larger offsets
  const RADIUS_NOISE_FACTOR = options.radiusNoiseFactor.value;

  // the zoom factor applied to the inputs to the noise controlling the height of the pulpit
  // larger values create a distinct high side and low side

  const PULPIT_SKEW_FACTOR = options.pulpitSkewFactor.value;

  // reserving out as "fixed options"
  const WALL_THICKNESS = 0.1;
  const STEPS = 10;
  const POINTS_PER_LOOP = 30;

  // generate the points for the inside and the outside at the same time in two separate lists
  const points = [];
  const insidePoints = [];
  const noise3D = createNoise3D();
  const noise2D = createNoise2D();

  const yStepSize = PULPIT_LENGTH / STEPS;

  for (let i = 0; i <= STEPS; i++) {
    const baseY = i * yStepSize;
    const baseRadius =
      BOTTOM_THICKNESS + (THICKNESS - BOTTOM_THICKNESS) * (i / STEPS);

    for (let j = 0; j < POINTS_PER_LOOP; j++) {
      // calculate the "clean" position

      const baseX = Math.sin((j * 2 * Math.PI) / POINTS_PER_LOOP) * baseRadius;
      const baseZ = Math.cos((j * 2 * Math.PI) / POINTS_PER_LOOP) * baseRadius;

      // use the clean position to create the radius with noise
      const radius =
        baseRadius +
        RADIUS_NOISE_FACTOR *
          noise3D(
            baseX * HORIZONTAL_NOISE_ZOOM,
            baseZ * HORIZONTAL_NOISE_ZOOM,
            baseY * VERTICAL_NOISE_ZOOM
          );

      const x = Math.sin((j * 2 * Math.PI) / POINTS_PER_LOOP) * radius;
      const z = Math.cos((j * 2 * Math.PI) / POINTS_PER_LOOP) * radius;

      let y = baseY;

      if (i > 0) {
        const lastY = points[points.length - POINTS_PER_LOOP].y;
        const n = noise2D(x * PULPIT_SKEW_FACTOR, z * PULPIT_SKEW_FACTOR) + 1;
        const yOffset = n * yStepSize;

        y = lastY + yOffset;
      }

      points.push(new Vector3(x, y, z));

      const insideX =
        Math.sin((j * 2 * Math.PI) / POINTS_PER_LOOP) *
        (radius - WALL_THICKNESS);
      const insideZ =
        Math.cos((j * 2 * Math.PI) / POINTS_PER_LOOP) *
        (radius - WALL_THICKNESS);
      insidePoints.push(new Vector3(insideX, y, insideZ));
    }
  }

  // generate the faces for the two surfaces
  const faces = generateFaces(points, POINTS_PER_LOOP);
  const insideFaces = generateFaces(insidePoints, POINTS_PER_LOOP, true);

  // merge the two into a single list
  const allPoints = points.concat(insidePoints);
  insideFaces.forEach((f) => {
    f[0] += points.length;
    f[1] += points.length;
    f[2] += points.length;
  });
  const allFaces = faces.concat(insideFaces);

  // add faces connecting the inside and outside
  // the outside points should start at points.length-POINTS_PER_LOOP
  // the inside points should start at allPoints.length-POINTS_PER_LOOP
  for (let i = 0; i < POINTS_PER_LOOP; i++) {
    const nextBase = (i + 1) % POINTS_PER_LOOP;
    const current = points.length - POINTS_PER_LOOP + i;
    const next = points.length - POINTS_PER_LOOP + nextBase;

    allFaces.push([current, current + insidePoints.length, next]);
    allFaces.push([
      next,
      current + insidePoints.length,
      next + insidePoints.length,
    ]);
  }

  const pulpit = renderPoints(
    allPoints,
    allFaces,
    "pulpit",
    false,
    false
  );

  if (options.centralShaft.value) {
    const centralShaft = simpleRhinophoreMesh(options);
    centralShaft.parent = pulpit;
  }



  return pulpit;
}
