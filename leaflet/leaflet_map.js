L.TopoJSON = L.GeoJSON.extend({
    addData: function (data) {
        var geojson, key;
        if (data.type === "Topology") {
            for (key in data.objects) {
                if (data.objects.hasOwnProperty(key)) {
                    geojson = topojson.feature(data, data.objects[key]);
                    L.GeoJSON.prototype.addData.call(this, geojson);
                }
            }

            return this;
        }

        L.GeoJSON.prototype.addData.call(this, data);

        return this;
    }
});

L.topoJson = function (data, options) {
    return new L.TopoJSON(data, options);
};

function countKeys(obj) {
    return Object.keys(obj).length;
}


var highlight = {
    'color': '#ffffff',
    'weight': 2,
    'opacity': 1,
    'fillColor': '#ffffff',
    'fillOpacity': 0.5
};

var remove_highlight = {
    'color': "#d2d2d2",
    'weight': 1,
    'fillColor': "#8d8c91",
    'fillOpacity': 1
};


var typeEco = {
    "ME": "#F012BE",
    "SE": "#85144b",
    "XX": "rgb(39,39,48)",
    "YS": "#c9c731"
};

var typeSE = {
    "OF": "#2ECC40",
    "MF": "#3D9970",
    "WD": "#653f2e",
    "RI": "#00236e",
    "IT": "#eeaf8c",
    "WN": "#0074D9",
    "HB": "#98Fb98",
    "SV": "#857e4e",
    "ES": "#7FDBFF",
    "FW": "#39CCCC",
    "AP": "#AAAAAA",

};

// initialize the map


var cartodbAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

// 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
grayScaleBaseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
    {
        edgeBufferTiles: 1,
        attribution: cartodbAttribution,
        maxZoom: 17,
        minZoom: 2
    });


streetsBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        edgeBufferTiles: 1,
        attribution: cartodbAttribution,
        maxZoom: 19,
        minZoom: 2
    });

var baseLayers = {
    "Grayscale": grayScaleBaseMap,
    "Streets": streetsBaseMap
};

var overlays = {};
var num_overlays = 1;

var map = L.map('map', {
    center: [49.263710, -123.259378],
    zoom: 10,
    layers: [streetsBaseMap, grayScaleBaseMap]
});

grayScaleBaseMap.addTo(map);

function openWiki(callback, speciesName) {
    var title = callback.query.search[0].title;

    var url = title.replace(/ /g, "_");

    var speciesId = speciesName.replace(/\s+/g, '_');

    var wikiButton = document.getElementById(speciesId + "_wiki");
    wikiButton.onclick = function () {
        window.open("https://en.wikipedia.org/wiki/" + url, "_blank");
    };
    wikiButton.value = "Wikipedia";
}


function loadImg(speciesName) { //AJAX request
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + speciesName + "&prop=info&inprop=url&utf8=&format=json",
        dataType: "jsonp",
        success: function (response) {
            // console.log(response.query);
            if (response.query.searchinfo.totalhits === 0) {
                alert("No results");
            } else {
                wikiImg(response.query.search[0].title, speciesName);
                openWiki(response, speciesName);
            }
        },
        error: function () {
            alert("Error retrieving search results, please refresh the page");
        }
    });
}


function wikiImg(pageTitle, speciesName) { //AJAX request
    $.ajax({
        url: "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki&props=claims&titles=" + pageTitle,
        dataType: "jsonp",
        success: function (response) {
            // console.log(response.query);
            // if (response.query.searchinfo.totalhits === 0) {
            // 	showError(keyword);
            // }

            // else {
            imgResults(response, speciesName);
            // }
        },
        error: function () {
            alert("Error retrieving search results, please refresh the page");
        }
    });
}

function imgResults(callback, speciesName) {

    var img_name = callback.entities;
    var key_entity = Object.keys(img_name)[0];
    img_name = callback.entities[key_entity].claims.P18[0].mainsnak.datavalue.value;

    img_name = img_name.replace(/\s+/g, '_');
    // console.log(img_name);
    var img_name_hash = md5(img_name);
    var img_url = 'https://upload.wikimedia.org/wikipedia/commons/' + img_name_hash[0] +
        '/' + img_name_hash.substr(0, 2) + '/' + img_name;
    // console.log(img_url);
    var speciesId = speciesName.replace(/\s+/g, '_');

    var img = new Image(),
        url = img_url,
        container = document.getElementById(speciesId + "_thumb");

    img.onload = function () {
        container.appendChild(img);
    };
    img.src = url;
    // return img_url;
}

var dotIcon = L.icon({
    iconUrl: 'blue_dot.png',
    iconSize: [10, 10]
});


var shapes_layer;
$.getJSON("SEI.topojson", function (data) {
    shapes_layer = L.topoJson(data, {

        style: function (feature) {
            sstyle = remove_highlight;
            if (feature.properties.SE_ME_1 != "SE") {
                sstyle.fillColor = typeEco[feature.properties.SE_ME_1];
            } else {
                sstyle.fillColor = typeSE[feature.properties.SECl_1];
            }

            return sstyle;
        },
        onEachFeature: function (feature, layer) {
            var popUpInfo = feature.properties.Comp1Lgnd_;
            if (feature.properties.Comp2Lgnd_) {
                popUpInfo += "<br/>" + feature.properties.Comp2Lgnd_;
                if (feature.properties.Comp3Lgnd_) {
                    popUpInfo += "<br/>" + feature.properties.Comp3Lgnd_;
                }
            }
            popUpInfo += "</br> Quality: " + feature.properties.QualityNo_ + "/5.0";
            if (feature.properties.Location) {
                popUpInfo += "</br> Location: " + feature.properties.Location;
            }
            // var popUp = layer.bindPopup(popUpInfo);
            // popUp.on('popupclose', function() {
            //     // layer.setStyle(remove_highlight);
            // });
            layer.on('click', function () {
                layer.bringToFront();
                if (layer.selected) {
                    sstyle = remove_highlight;
                    if (feature.properties.SE_ME_1 != "SE") {
                        sstyle.fillColor = typeEco[feature.properties.SE_ME_1];
                    } else {
                        sstyle.fillColor = typeSE[feature.properties.SECl_1];
                    }
                    layer.setStyle(sstyle);
                    layer.selected = 0;
                    layer.unbindPopup();
                } else {
                    sstyle = highlight;
                    // if (feature.properties.SE_ME_1 != "SE") {
                    //     sstyle.fillColor = typeEco[feature.properties.SE_ME_1];
                    // }
                    // else {
                    //     sstyle.fillColor = typeSE[feature.properties.SECl_1];
                    // }
                    layer.setStyle(sstyle);
                    layer.selected = 1;
                    layer.bindPopup(popUpInfo).openPopup();
                }
            })
        }
    })
        .addTo(map);
    overlays.SEI = shapes_layer;
    if (countKeys(overlays) == num_overlays) {
        L.control.layers(baseLayers, overlays, {collapsed: false}).addTo(map);
    }
});



var points_layer_options = {
    pointToLayer: function (feature, latlng) {
        var marker = L.marker(latlng, {icon: dotIcon});
        if (feature.properties) {
            var redList = feature.properties.redList;
            var markerPopUp = '<div class="popUpfeature">' + feature.properties.species + '<br/> <b>'
                + feature.properties.common.split(',')[0] + '</b>';
            if (redList) {
                markerPopUp += '<b class="redListFont">' + '<br/>' + feature.properties.redList + '</b>';
            }

            markerPopUp += '<br/>';

            var id_species = feature.properties.species;
            if (id_species) {
                id_species = id_species.replace(/\s+/g, '_');
            }

            // markerPopUp += '<input type="button" value="wikiImg" '+  ' onClick="loadImg(\'' + feature.properties.species + '\')" />';

            // markerPopUp += '<input type="button" value="Wiki" '+ ' onClick="goToWiki(\'' + feature.properties.species + '\')" />';

            markerPopUp += '<input type="button" class="wikiButton" value="Loading" id=' + (id_species + "_wiki") + '>';

            markerPopUp += '<div class="thumbnail"  id=' + (id_species + "_thumb") + '> </div>';

            markerPopUp += '</div>';

            marker.bindPopup(markerPopUp);

            marker.on('click', function () {
                loadImg(feature.properties.species);
            });
        }
        // var marker = L.marker(latlng, {title: ""});
        return marker;
    }
};

var clusters = L.markerClusterGroup(
            {
                iconCreateFunction: function (cluster) {
                    var i = 0;
                    var childrenMarkers = cluster.getAllChildMarkers();
                    var endangered = 0;
                    for (i = 0; i < childrenMarkers.length; i++) {
                        if (childrenMarkers[i].feature.properties.redList) {
                            endangered = 1;
                            break;
                        }
                    }
                    var num_children = cluster.getChildCount();
                    if (num_children == 1) {
                        num_children = "";
                    }
                    if (endangered) {
                        return L.divIcon({html: num_children, className: 'endangered', iconSize: 15});
                    } else {
                        return L.divIcon({html: num_children, className: 'not_endangered', iconSize: 15});
                    }


                }, singleMarkerMode: 1
            }
        );
clusters.addTo(map);

points_layers = [];

function loadPointsJson(year) {
        $.getJSON("gbif/"+ year.toString() + ".geojson", function (data) {
        points_layers[year] = L.geoJSON(data, points_layer_options);
        clusters.addLayer(points_layers[year]);
    });
}

function deletePointsLayer(year) {
    clusters.removeLayer(points_layers[year]);
    points_layers[year] = null;
}

var init_year = 1990;

data_select2 = [];

for (let i = init_year; i <= 2019; i++) {

    //select2 data
    data_select2.push( {
        id: "year-" + i.toString(),
        text: i.toString()
    });
}

select2_element = $(".select2-year").select2({
  data: data_select2,
  width: 'resolve',
    closeOnSelect: false,
});

selections = [];

function plotGbif() {
    selections.forEach(function(sel) {
        deletePointsLayer(parseInt(sel.text));
    });
    selections = select2_element.select2('data');
    selections.forEach(function(sel) {
        loadPointsJson(parseInt(sel.text));
    })
}



