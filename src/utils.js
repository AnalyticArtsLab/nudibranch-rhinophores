import { Vector3, MeshBuilder, Mesh, VertexData, StandardMaterial } from "@babylonjs/core";


/**
 * This function makes a rounded cylinder mesh.
 * The basic approach is to create a C shape that include the round over and
 * then use the lathe to spin it around Y
 * @param {number} diameter The diameter of the cylinder.
 * @param {number} height The height of the cylinder.
 * @param {number} edgeRadius The radius of the rounded edges.
 */

export function roundedCylinder(diameter, height, edgeRadius) {
  const points = [];
  const insideRadius = diameter / 2 - edgeRadius;

  // two points on the plane for the base
  points.push(new Vector3(0, 0, 0));
  points.push(new Vector3(insideRadius / 2, 0, 0));

  // bottom curve
  for (
    let theta = (3 * Math.PI) / 2;
    theta < 2 * Math.PI;
    theta += Math.PI / 8
  ) {
    const y = edgeRadius * Math.sin(theta) + edgeRadius;
    const x = edgeRadius * Math.cos(theta) + insideRadius;
    points.push(new Vector3(x, y, 0));
  }

  // add a point halfway up the cylinder to provide some more segmentation
  points.push(new Vector3(diameter / 2, height / 2, 0));

  // top curve
  for (let theta = 0; theta < Math.PI / 2; theta += Math.PI / 8) {
    const y = edgeRadius * Math.sin(theta) + height - edgeRadius;
    const x = edgeRadius * Math.cos(theta) + insideRadius;
    points.push(new Vector3(x, y, 0));
  }

  // two points on the plane for the top
  points.push(new Vector3(insideRadius / 2, height, 0));
  points.push(new Vector3(0, height, 0));

  const cyl = MeshBuilder.CreateLathe("cylinder rim", {
    shape: points,
  });

  return cyl;
}


export function renderPoints(
  points,
  faces,
  name = "mesh",
  showWireframe = false,
  renderBackface = false
) {
  const rawPoints = [];
  points.forEach((p) => {
    rawPoints.push(p.x);
    rawPoints.push(p.y);
    rawPoints.push(p.z);
  });

  const rawFaces = faces.reduce((flat, item) => flat.concat(item));

  // a wireframe of the original shape
  const mesh = new Mesh(name);

  const normals = [];
  VertexData.ComputeNormals(rawPoints, rawFaces, normals);

  const vertexData = new VertexData();
  vertexData.positions = rawPoints;
  vertexData.indices = rawFaces;
  vertexData.normals = normals;
  if (points[0].color) {
    const colors = [];
    points.forEach((p) => {
      colors.push(p.color[0]);
      colors.push(p.color[1]);
      colors.push(p.color[2]);
      colors.push(p.color[3]);
    });
    vertexData.colors = colors;
  }

  vertexData.applyToMesh(mesh);

  const material = new StandardMaterial("texture1");
  material.wireframe = showWireframe;
  mesh.material = material;

  material.backFaceCulling = !renderBackface;
  return mesh;
}

export function generateFaces(points, loopLength, insideFace = false){
  const faces = [];
  const STEPS = points.length / loopLength;

  for (let i = 0; i < STEPS - 1; i++) {
    for (let j = 0; j < loopLength; j++) {
      const current = i * loopLength + j;
      const next = i * loopLength + ((j + 1) % loopLength);
      if (insideFace) {
        faces.push([current, next, current + loopLength]);
        faces.push([next, next + loopLength, current + loopLength]);
      } else {
        faces.push([current, current + loopLength, next]);
        faces.push([next, current + loopLength, next + loopLength]);
      }
    }
  }

  return faces;
};
