
//Create the Leaflet map, set view and zoom levels
map = L.map('mapid').setView([44.889016, -103.974609],4,);
lyrOSM = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
//     attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
// //setting max and min zoom (starts with a comma after attribution informaiton
    maxZoom: 16,
    minZoom: 3
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
    "TopoMap": Esri_WorldTopoMap
};

L.control.layers(baseLayers).addTo(map);

//data layers
var npscenter = L.geoJSON.ajax('data/nps_centroids.geojson', {
    color:'none',
    transparency: '100',
    onEachFeature: function (feature,layer) {
        content = '<b>' + feature.properties.UNIT_NAME + '</b>' + "<br>Click on park boundary for detailed information";
        layer.bindTooltip(content);
    }
}).addTo(map);

var states = L.geoJSON.ajax('data/states.geojson', {color:'none'}).addTo(map);
var npsbounds = L.geoJSON.ajax('data/nps_boundary.geojson', {
    color: 'green'
});
/* var npsbounds = L.geoJSON.ajax('data/nps_boundary_simplified_filtered.geojson', {
    color: 'green',
    fill: 'dark green',
    onEachFeature: function (feature, layer) {
        //console.log("Name: " + feature.properties.UNIT_NAME + " (" + feature.properties.UNIT_CODE + ")" + " <br>" + "State: " + feature.properties.STATE + " <br>" + "Date Established: " + feature.properties.ESTBLSHD + " <br>" + "Phone Number: " + feature.properties.PHONE + " <br>" + "Website: " + feature.properties.WEBSITE + " <br>" + "Description: " + feature.properties.DESCR);
        content = feature.properties.UNIT_NAME + "<br> Placeholder for notice to open sidepanel";
        layer.bindTooltip(content);
    }
}).addTo(map); */


// control that shows park info on click and hover
var info = L.control();

info.onAdd = function (map) {
    document.getElementById("info").innerHTML = "Paragraph changed!";
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    document.getElementById("info").innerHTML = (props ?
        '<b>' + '<h4>' +  props.UNIT_NAME + '</h4></b><br>' + '<a target ="_blank" href="' 
        + props.IMAGE + '">' + '<img src ="' + props.IMAGE + '" alt="Park image" width="200">' + '</a>' + '<br><br>' 
        + "<b>State: </b>" + props.STATE + " <br>" + "<b>Date Established: </b>" +  props.ESTBLSHD
            + " <br>" + "<b>Phone Number: </b>" +  props.PHONE + " <br>" + "<b>Website: </b>" + "<a href=" 
            + '"' + props.WEBSITE + '" target="_blank">' + "Park Homepage" + "</a>" + " <br>"
            + "<b>Description: </b>" +  props.DESCR 
        : '<i>Search for a park above or click on a park boundary on the map for more information</i>');
    // document.getElementById("image").innerHTML = (props ?
    //     '<img src ="' + props.IMAGE + '">' : 'no image');
};

info.addTo(map);




// control that shows state info on hover
function  highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    //info.update();
}

function zoomToFeature(e) {
    var layer = e.target;
    map.fitBounds(e.target.getBounds());
    info.update(layer.feature.properties);
    ctlSidebar.show();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


geojson = L.geoJson.ajax('data/nps_boundary.geojson', {
    color:'green',
    onEachFeature: onEachFeature
}).addTo(map);


//remove leaftlet intial zoom buttons to allow for combined + / zoom to extent / - button
map.removeControl(map.zoomControl);

//adding a scale to bottom left of the map
ctlscale = L.control.scale({position:'bottomright', maxWidth:300}).addTo(map);

//pass the name of the div / sidebar - to put the search component area and possibly legend
//sidebar was removed to allow for buttons surrounding the map allowing for a better view of the map.
//this line needs to remain it is linked to the modal prompt
ctlSidebar = L.control.sidebar('sidebar').addTo(map);

//the button icon is not showing up. using bootstrap glypicon graphic
ctlEasyButton = L.easyButton('<img src="images/arrow.png">', function() {
   // alert('you just clicked the html entity \&target;');
    ctlSidebar.toggle();
//add information for when hover over the icon
}, 'Open / Close for Search Options and additional information').addTo(map);


//search control for states
var searchControl = new L.Control.Search({
   //dataType: "json",
   container: 'search-container',
   layer: states,
   propertyName: 'STATE_NAME',
   textPlaceholder: 'Enter State',
   initial: true,
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
    container: 'search-container',
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

function setPanel(panelContent) {
    ctlSidebar.setContent(panelContent);
    //$("#panel").html(panelContent);
    ctlSidebar.show();
};

// function Panel(panelContent, properties, layer) {
//     this.properties = properties;
//     this.attribute = attribute;
//     this.layer = layer;
//     this.content = panelContent;

// }

//used for opening centering of map with the home button
var lat = 44.8890;
var lng = -103.9746;
var zoom = 4.0;

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

