import { Component } from "@angular/core";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { easeIn, easeOut } from "ol/easing.js";
import TileLayer from "ol/layer/Tile.js";
import { fromLonLat } from "ol/proj.js";
import OSM from "ol/source/OSM.js";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "app";

  london = fromLonLat([-0.12755, 51.507222]);
  moscow = fromLonLat([37.6178, 55.7517]);
  istanbul = fromLonLat([28.9744, 41.0128]);
  rome = fromLonLat([12.5, 41.9]);
  bern = fromLonLat([7.4458, 46.95]);

  view: View;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.view = new View({
      center: this.istanbul,
      zoom: 6
    });

    var map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          preload: 4,
          source: new OSM()
        })
      ],
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: this.view
    });
  }

  rotateLeft() {
    this.view.animate({
      rotation: this.view.getRotation() + Math.PI / 2
    });
  }

  rotateRight() {
    this.view.animate({
      rotation: this.view.getRotation() - Math.PI / 2
    });
  }

  panToLondon() {
    this.view.animate({
      center: this.london,
      duration: 2000
    });
  }

  elasticToMoscow() {
    this.view.animate({
      center: this.moscow,
      duration: 2000,
      easing: this.elastic
    });
  }

  elastic(t) {
    return (
      Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
    );
  }

  bounceToIstanbul() {
    this.view.animate({
      center: this.istanbul,
      duration: 2000,
      easing: this.bounce
    });
  }

  spinToRome() {
    // Rotation animation takes the shortest arc, so animate in two parts
    var center = this.view.getCenter();
    this.view.animate(
      {
        center: [
          center[0] + (this.rome[0] - center[0]) / 2,
          center[1] + (this.rome[1] - center[1]) / 2
        ],
        rotation: Math.PI,
        easing: easeIn
      },
      {
        center: this.rome,
        rotation: 2 * Math.PI,
        easing: easeOut
      }
    );
  }

  // A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
  bounce(t) {
    var s = 7.5625;
    var p = 2.75;
    var l;
    if (t < 1 / p) {
      l = s * t * t;
    } else {
      if (t < 2 / p) {
        t -= 1.5 / p;
        l = s * t * t + 0.75;
      } else {
        if (t < 2.5 / p) {
          t -= 2.25 / p;
          l = s * t * t + 0.9375;
        } else {
          t -= 2.625 / p;
          l = s * t * t + 0.984375;
        }
      }
    }
    return l;
  }

  flyToBern(){
    this.flyTo(this.bern, function() {console.log('Fly To Bern')});
  }

   flyTo(location, done) {
    var duration = 2000;
    var zoom = this.view.getZoom();
    var parts = 2;
    var called = false;
    function callback(complete) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        done(complete);
      }
    }
    this.view.animate({
      center: location,
      duration: duration
    }, callback);
    this.view.animate({
      zoom: zoom - 1,
      duration: duration / 2
    }, {
      zoom: zoom,
      duration: duration / 2
    }, callback);
  }


  rotateAroundRome(){
        // Rotation animation takes the shortest arc, so animate in two parts
        var rotation = this.view.getRotation();
        this.view.animate({
          rotation: rotation + Math.PI,
          anchor: this.rome,
          easing: easeIn
        }, {
          rotation: rotation + 2 * Math.PI,
          anchor: this.rome,
          easing: easeOut
        });
  }


  takeATour() {
    var locations = [this.london, this.bern, this.rome, this.moscow, this.istanbul];
    var index = -1;
    var next = (more) => {
      if (more) {
        ++index;
        if (index < locations.length) {
          var delay = index === 0 ? 0 : 750;
          setTimeout(()=> {
            this.flyTo(locations[index], next);
          }, delay);
        } else {
          alert('Tour complete');
        }
      } else {
        alert('Tour cancelled');
      }
    }
    next(true);
  }
}
