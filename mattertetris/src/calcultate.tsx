import { useEffect, useRef, useState } from "react";
import {
  Engine,
  Render,
  Runner,
  Bodies,
  World,
  Body,
  Events,
  Composite,
  Vertices,
  IChamferableBodyDefinition,
} from "matter-js";

export class UnionFind {
    count: number;
    parent: number[];

    constructor(elements: number[]) {
      this.count = elements.length;
      this.parent = [];
      for (let i = 0; i < this.count; i++) {
        this.parent[i] = i;
      }
    }

    union(a: number, b: number): void {
      let rootA = this.find(a);
      let rootB = this.find(b);

      if (rootA === rootB) return;

      if (rootA < rootB) {
        if (this.parent[b] !== b) this.union(this.parent[b], a);
        this.parent[b] = this.parent[a];
      } else {
        if (this.parent[a] !== a) this.union(this.parent[a], b);
        this.parent[a] = this.parent[b];
      }
    }

    find(a: number): number {
      while (this.parent[a] !== a) {
        a = this.parent[a];
      }
      return a;
    }

    connected(a: number, b: number): boolean {
      return this.find(a) === this.find(b);
    }
  }

  export function mapToVector(coord: any) {
    if (coord.length !== 2) {
      console.error("invalid coordinates");
      return;
    }

    return { x: coord[0], y: coord[1] };
  }

  export function geoJsonToVectors(geometry: any) {
    if (!geometry) {
      console.error("geometry is null or undefined");
      return;
    }

    if (geometry.length !== 1) {
      console.error("invalid geometry");
      return;
    }

    const polygon = geometry[0].slice();
    polygon.pop();
    const result = polygon.map(mapToVector);
    return result;
  }

  export function createBody(geometry: any, style: string) {
    const points = geoJsonToVectors(geometry);
    return Bodies.fromVertices(
      Vertices.centre(points).x,
      Vertices.centre(points).y,
      points,
      {
        render: { fillStyle: style },
      }
    );
  }

  export function verticesToGeometry(body: any) {
    let vertices = Vertices.clockwiseSort(body.vertices.slice());
    vertices.push(vertices[0]);
    return [vertices.map(vertexToArray)];
  }

  export function vertexToArray(vertex: any) {
    return [vertex.x, vertex.y];
  }

  export function calculateDistance(point1: any, point2: any) {
    let dx = point1.x - point2.x;
    let dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  export function shouldCombine(body1: any[], body2: any[], maxDistance: number) {
    for (let i = 0; i < body1.length; i++) {
      for (let j = 0; j < body2.length; j++) {
        let distance = calculateDistance(body1[i], body2[j]);
        if (distance <= maxDistance) {
          return true;
        }
      }
    }
    return false;
  }

  