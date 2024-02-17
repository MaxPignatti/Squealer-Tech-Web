<template>
  <div class="map-container" :style="{ height: mapContainerHeight }">
    <div ref="mapElement" class="map" :class="{ hidden: !mapActive }"></div>
    <button @click="activateMap" class="activate-map-btn" v-if="!mapActive">
      Condividi Posizione
    </button>
    <button
      @click="removeLocation"
      class="remove-location-btn"
      v-if="selectedLocation"
    >
      Rimuovi Posizione
    </button>
  </div>
</template>
<script>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";

export default {
  emits: ["locationChange", "removeLocation"],
  props: {
    location: {
      type: Object,
      default: () => ({ lat: 45.464211, lon: 9.191383 }),
    },
  },

  data() {
    return {
      map: null,
      markerLayer: null,
      selectedLocation: null,
      mapActive: false,
      mapContainerHeight: "auto",
    };
  },

  computed: {
    // Crea una computed property che restituisce un valore di default se location è null
    effectiveLocation() {
      return this.location || { lat: 45.464211, lon: 9.191383 };
    },
  },

  methods: {
    activateMap() {
      this.mapActive = true;
      this.mapContainerHeight = "400px";
      this.mapActive = true;
      this.$nextTick(() => {
        if (!this.map) {
          this.initializeMap();
        }
      });
    },
    initializeMap() {
      const initialPosition = fromLonLat([
        this.effectiveLocation.lon,
        this.effectiveLocation.lat,
      ]);
      this.map = new Map({
        target: this.$refs.mapElement,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: initialPosition,
          zoom: 10,
        }),
      });

      this.map.on("singleclick", (event) => {
        const coordinates = event.coordinate;
        this.selectedLocation = fromLonLat(coordinates);
        this.addMarker(coordinates);
      });
    },
    addMarker(position) {
      if (this.markerLayer) {
        this.map.removeLayer(this.markerLayer);
      }
      const marker = new Feature({
        geometry: new Point(position),
      });
      this.markerLayer = new VectorLayer({
        source: new VectorSource({
          features: [marker],
        }),
      });
      this.map.addLayer(this.markerLayer);
    },
    removeLocation() {
      if (this.markerLayer) {
        this.map.removeLayer(this.markerLayer);
        this.markerLayer = null;
        this.selectedLocation = null;
      }
      this.mapActive = false; // Nasconde la mappa
      this.mapContainerHeight = "auto";
    },
  },
};
</script>

<style>
.map-container {
  position: relative;
  width: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

.activate-map-btn {
  position: relative;
  background-color: #4caf50; /* Colore verde */
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-location-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100; /* Assicurati che il bottone sia sopra la mappa */
  margin-left: 10px;
  background-color: #4caf50; /* Colore verde */
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.remove-location-btn {
  right: auto;
  left: 10px;
}

.hidden {
  display: none; /* Nasconde la mappa quando mapActive è false */
}
</style>
