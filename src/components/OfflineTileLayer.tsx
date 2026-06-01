import {
  createElementObject,
  createTileLayerComponent,
  updateGridLayer,
  withPane,
} from "@react-leaflet/core";
import L from "leaflet";
import { getCachedTile } from "../utils/tileCache";

// Define the OfflineTileLayer props conforming to Leaflet's TileLayerOptions
export interface OfflineTileLayerProps extends L.TileLayerOptions {
  url: string;
}

// Extend standard Leaflet TileLayer to load cached blob assets from browser memory
const CustomLeafletTileLayer = L.TileLayer.extend({
  createTile(
    this: L.TileLayer,
    coords: L.Coords,
    done: L.DoneCallback
  ): HTMLElement {
    const tile = document.createElement("img");
    const url = this.getTileUrl(coords);

    // Prevent dragging ghosts and improve accessibility
    tile.alt = "";
    tile.setAttribute("role", "presentation");

    getCachedTile(url)
      .then((blobUrl) => {
        tile.src = blobUrl;
        done(undefined, tile);
      })
      .catch((err) => {
        done(err, tile);
      });

    return tile;
  },
}) as unknown as new (url: string, options?: L.TileLayerOptions) => L.TileLayer;

// Build the react-leaflet component utilizing standard core bindings
export const OfflineTileLayer = createTileLayerComponent<
  L.TileLayer,
  OfflineTileLayerProps
>(
  function createOfflineTileLayer({ url, ...options }, context) {
    const layer = new CustomLeafletTileLayer(url, withPane(options, context));
    return createElementObject(layer, context);
  },
  function updateOfflineTileLayer(layer, props, prevProps) {
    updateGridLayer(layer, props, prevProps);
    const { url } = props;
    if (url != null && url !== prevProps.url) {
      layer.setUrl(url);
    }
  }
);

export default OfflineTileLayer;
