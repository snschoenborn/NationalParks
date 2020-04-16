
//Create the Leaflet map, set view and zoom levels
map = L.map('mapid').setView([39.8283, -98.5795],5,);
lyrOSM = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
//     attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
// //setting max and min zoom (starts with a comma after attribution informaiton
    maxZoom: 16,
    minZoom:4
}).addTo(map);

//adding the layers for switching views
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

var baseLayers = {
    "Imagery": Esri_WorldImagery,
    //"<span style='color: gray'>Imagery</span>": Esri_WorldImagery,
    "TopoMap": Esri_WorldTopoMap
};

L.control.layers(baseLayers).addTo(map);

//used for opening centering of map
var lat = 39.8283;
var lng = -98.5795;
var zoom = 5;

//data layers
var npscenter = L.geoJSON.ajax('data/nps_boundary_centroids_filtered.geojson');
var states = L.geoJSON.ajax('data/states.geojson', {color:'none'}).addTo(map);
var npsbounds = L.geoJSON.ajax('data/nps_boundary_simplified_filtered.geojson', {
    color: 'green',
    fill: 'dark green',
    }).addTo(map);
    // issue is that you have to click on the center of polygon also tried .bindtooltip but still tricky becase need to hover over center so switched to tooltip so when mouse over you can see the info to show text
    //npsbounds.bindPopup("test");
    npsbounds.bindTooltip("test");




//remove leaftlet intial zoom buttons to allow for combined + / zoom to extent / - button
map.removeControl(map.zoomControl);

//adding a scale to bottom left of the map
ctlscale = L.control.scale({position:'bottomright', maxWidth:300}).addTo(map);

//pass the name of the div / sidebar - to put the search component area and possibly legend
//sidebar was removed to allow for buttons surrounding the map allowing for a better view of the map.
//this line needs to remain it is linked to the modal prompt
ctlSidebar = L.control.sidebar('sidebar').addTo(map);

//the button icon is not showing up. using bootstrap glypicon graphic
ctlEasyButton = L.easyButton('fa-crosshairs fa-lg', function() {
   // alert('you just clicked the html entity \&target;');
    ctlSidebar.toggle();
//add information for when hover over the icon
}, 'Open / Close for Search Options and additional information').addTo(map);

/* //this can be changed to anythng we want or removed.
//this pops up the link for additional information and holding shift and click show the zoom level
function onMapClick(e) {
    //alert("You clicked the map at " + e.latlng);
    //alert(e.latlng.toString());
    if (e.originalEvent.shiftKey) {
        alert("Zoom Level:  " + map.getZoom());
    } else {
        //need to add NOAA as a website link. so it can be clicked on as option for more info.
        alert("Additional Data Can be found on NOAA's Storm Prediction website:  https://www.spc.noaa.gov/wcm/#ATP");
    }
}
map.on('click', onMapClick); */




//search control for states
var searchControl = new L.Control.Search({
   //dataType: "json",
   container: 'sidebar',
   layer: states,
   propertyName: 'STATE_NAME',
   textPlaceholder: 'Enter State',
   initial: false,
   collapsed: false,
   autoResize: false,


  moveToLocation: function(latlng) {
      console.log(latlng +" Coordinates");
      map.setView(latlng, 7); // set the zoom
  }
});
map.addControl( searchControl );

//search control by park name based off of nps center
var searchControl = new L.Control.Search({
    //dataType: "json",
    container: 'sidebar',
    layer: npsbounds,
    propertyName: 'UNIT_NAME',
    textPlaceholder: 'Enter Park Name',
    initial: false,
    collapsed: false,
    autoResize: false,


    moveToLocation: function(latlng) {
        console.log(latlng +" Coordinates");
        map.setView(latlng, 7); // set the zoom
    }
});
map.addControl( searchControl );



// custom zoom bar control that includes a Zoom Home function
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<img src="images/home1.png">',
        zoomHomeTitle: 'Zoom home'
    },


    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
            controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
            controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
            controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView([lat, lng], zoom);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);

