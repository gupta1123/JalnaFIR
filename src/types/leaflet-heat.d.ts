declare module 'leaflet.heat' {
  import { Layer } from 'leaflet';
  
  interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    gradient?: { [key: number]: string };
  }
  
  function heatLayer(
    data: number[][],
    options?: HeatLayerOptions
  ): Layer;
  
  export = heatLayer;
}
