import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { HEMesh } from "he-mesh/src/he-mesh";
import { loopSubdivision } from "he-mesh/src/subdivision";


import { tee3D } from "he-mesh/test/meshes";


function renderPoints(points, faces, showWireframe = false, name = "mesh") {
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

  vertexData.applyToMesh(mesh);

  const material = new StandardMaterial("texture1");
  material.wireframe = showWireframe;
  mesh.material = material;

  return mesh;
}



function subdivisionExperiment() {
  const { points, faces } = tee3D;
const iterations = 3;
  const heMesh = new HEMesh(points, faces);

  for (let i = 0; i < iterations; i++) {
    loopSubdivision(heMesh);
  }

  const polySoup = heMesh.toPolygonSoup();
  const m0 = renderPoints(polySoup.points, polySoup.faces, false, "loopSubdivision");
}

export const createScene = async function (engine, canvas) {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new Scene(engine);
  scene.clearColor = new Color3(0.94, 0.95, 0.89);

  // This creates and positions a free camera (non-mesh)
  const camera1 = new ArcRotateCamera(
    "camera1",
    Math.PI / 2,
    Math.PI / 2,
    5,
    new Vector3(1.5, 1, 0),
    scene
  );
  camera1.attachControl(canvas, true);
  scene.activeCameras.push(camera1);

  const light = new HemisphericLight("light", new Vector3(-1.5, 1.5, 0.75), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  subdivisionExperiment();

  return scene;
};
