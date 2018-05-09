// Declare global variables.
var scene, camera, renderer;
    ///////////////////////
// Initial Variables //
///////////////////////

var MEANDATA, DATA, SUMDATA;

var guiParams;
// Values
var tick = 0;
var size = 0.25;

var red = 0xff0000;
var blue = 0x1176c5;
var white = 0xf9f9f9;
var iterator = 0;

// raycasting variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;

// tooltip variables
var canvas, context, texture1, sprite1;

var projector;
// Arrays
var bars = new Array();
var selectedBars = new Array();

var cylinders = new Array();
var controls;

document.addEventListener('DOMContentLoaded', init, false);
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener("click", onclick, true);


    // Create object of different parameters that can be changed via the GUI.
    guiParams = {
        // Move the sphere back to the starting position and restart the animation.
        'filter': function() {
            bars.forEach(bar => {
                if (bar.userData.value >= guiParams.minValue && bar.userData.value <= guiParams.maxValue){
                    bar.material.opacity = 1;
                } else {
                    bar.material.transparent = true;
                    bar.material.opacity = 0.2;
                    // scene.remove(bar);
                }
            });
        },
        'reset': function() {
            bars.forEach(bar => {
                scene.remove(bar);
            });
            cylinders.forEach(cylinder => {
                scene.remove(cylinder);
            });
            time = 0;
            iterator = 0;
            lastPosition = new THREE.Vector3(guiParams.radius, 0, 0);
            path = new THREE.Group();
            scene.add(path);
        },
        'focus': function(){

            cylinders.forEach(cylinder => {
                scene.add( cylinder );
            });
            // TODO : highlighting
            // var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
            // var outlineMesh2 = new THREE.Mesh( INTERSECTED.geometry, outlineMaterial2 );
            // outlineMesh2.position = INTERSECTED.position;
            // outlineMesh2.scale.multiplyScalar(1.05);
            // scene.add( outlineMesh2 );
        },
        'rotations': 100,
        'displayPeriods': false,
        'dayView': false,
        'toggleSideNav': true,
        'radius': 50,
        'velocity': 30,
        'zoomedObject': 0,
        'minValue': 6000,
        'maxValue': 40000,
        'numberOfPassengers': '',
        'date': '',
    };

function init() {

    console.log('initializing view');
    $("#tooltip").hide();

    // Declare vaiables in function scope.
    var geometry, material, sphere, axis, gui;
    var time = 0, currentPosition, lastPosition, path, lineGeometry, line;

    // Create scene, camera, and rendere objects.
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    scene.background = new THREE.Color( 0x5ff00 );
    renderer.setClearColor( 0xffffff, 0 );
    
    // Set coordinates for camera.
    camera.position.x = 180;
    camera.position.y = 180;
    camera.position.z = 180;

    // Add orbit controls to enable moving around.
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.zoomSpeed = 0.5;
    console.log('controls', controls);
    controls.keyPanSpeed = 7.0;

    // white spotlight shining from the side, casting a shadow

    var light = new THREE.AmbientLight( 0xc1ddda ); // soft white light
    scene.add( light );

    // var light = new THREE.PointLight( 0xff0000, 1, 100 );
    // light.position.set( 50, 50, 50 );
    // scene.add( light );

    // create a canvas element
	// canvas = document.createElement('canvas');
	// context = canvas.getContext('2d');
	// context.font = "Bold 20px Arial";
	// context.fillStyle = "rgba(0,0,0,0.95)";
    // context.fillText('Hello, world!', 0, 20);
    

    // // canvas contents will be used for a texture
	// texture1 = new THREE.Texture(canvas) 
	// texture1.needsUpdate = true;
	
	// ////////////////////////////////////////
	
    // var spriteMaterial = new THREE.SpriteMaterial( { map: texture1, useScreenCoordinates: true} );

    
	
	// sprite1 = new THREE.Sprite( spriteMaterial );
	// sprite1.scale.set(200,100,1.0);
	// sprite1.position.set( 50, 50, 0 );
    // scene.add( sprite1 );	
    

    console.log(canvas);
    console.log(context);

    // Add the renderer to the page.
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a basic blue material for the sphere and path.
    material = new THREE.MeshPhongMaterial({'color': 0x0080ff});


    // Create a sphere object.
    // SphereGeometry(radius, widthSegments, heightSegments);
    // sphere = new THREE.Mesh(new THREE.SphereGeometry(8, 20, 10), material);
    // sphere.position.set(50, 0, 0);
    // scene.add(sphere);

    // Create a 3D axes object.
    // axis = new THREE.AxisHelper(200);
    // axis.position.set(0, 0, 0);
    // scene.add(axis);

    // var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
    // var mat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // var plane = new THREE.Mesh(geo, mat);
    // // plane.material.transparent = true;
    // // plane.material.opacity = 0.5;
    // plane.position.y = - 20;

    // plane.rotateX( - Math.PI / 2);

    // scene.add(plane);


    // Create an object group to hold the lines that show the sphere's path.
    path = new THREE.Group();
    scene.add(path);


    // Create menu in the top right of screen.
    gui = new dat.GUI();
    // gui.add(guiParams, 'rotations', 1, 5).step(0.1); // Add slider to menu.
    // gui.add(guiParams, 'radius', 10, 100); // Add slider to menu.
    // gui.add(guiParams, 'velocity', 10, 50, 'velocity'); // Add slider to menu.
    var controller = gui.add(guiParams, 'displayPeriods');
    var dayView = gui.add(guiParams, 'dayView');
    var toggleSideNav = gui.add(guiParams, 'toggleSideNav');
    //gui.open(); // Open menu.

    controller.onChange(function(value) {
        if (guiParams.dayView == false) {
            cylinders.forEach(cylinder => {
                if (guiParams.displayPeriods == true)
                    scene.add(cylinder);
                else 
                    scene.remove(cylinder);
            });
        }
      });
      toggleSideNav.onChange(function(value) {
        if (guiParams.toggleSideNav == false) {
            $(".sidenav").hide();
        } else {
            $(".sidenav").show();
        }
        
      });


    lastPosition = new THREE.Vector3(guiParams.radius, 0, 0); // Store starting position.
    
    $.when(
        $.getJSON('data-mod.json'),
        $.getJSON('mean-json.json'),
        $.getJSON('sum-json.json')
    ).done(function(data, meanData, sumData) {
        console.log('norm data', data);
        console.log('mean-json', meanData);
        console.log('sum-json', sumData);
        render(data[0], 48);
        MEANDATA = meanData[0];
        SUMDATA = sumData[0];
        DATA = data[0];
        mergeJsons(MEANDATA, SUMDATA);
        mergeData(DATA, SUMDATA);
        console.log('mean-json', MEANDATA);

        dayView.onChange(function(value) {

            bars.forEach(bar => {
                scene.remove(bar);
            });
            cylinders.forEach(cylinder => {
                scene.remove(cylinder);
            });
            time = 0;
            iterator = 0;
            lastPosition = new THREE.Vector3(guiParams.radius, 0, 0);
            path = new THREE.Group();
            scene.add(path);

            if (guiParams.dayView == true) {
                render(MEANDATA, 32);
            } else {
                render(DATA, 48);
            }
            camera.position.x = 180;
            camera.position.y = 180;
            camera.position.z = 180;
        
        });
    });

    $( document ).dblclick(function() {

        console.log('dbl click');
    
    
        if (INTERSECTED.name == "period") {
            var timestamp = parseInt(INTERSECTED.userData.timestamp);
            console.log(timestamp);
            var date2 = new Date(timestamp);
            filteredArray = Array();
            var twoHours = 2 * 60 * 60 * 1000;
            // to add to the timestamp
            date2.setTime(date2.getTime() + twoHours);
            DATA.forEach(element => {
                var ts1 = parseInt(element.timestamp);
                var date1 = new Date(ts1);
                date1.setTime(date1.getTime() - twoHours)
                if(date1.setHours(0,0,0,0) == date2.setHours(0,0,0,0)) {
                    filteredArray.push(element);
                }
            });
    
            bars.forEach(bar => {
                scene.remove(bar);
            });
            cylinders.forEach(cylinder => {
                scene.remove(cylinder);
            });
            time = 0;
            iterator = 0;
            lastPosition = new THREE.Vector3(guiParams.radius, 0, 0);
            path = new THREE.Group();
            scene.add(path);
            console.log(filteredArray);
            render(filteredArray, 48);
            camera.position.x = 180;
            camera.position.y = 180;
            camera.position.z = 180;
            controls.reset();
        }
    });

        // Create a function to update all the objects and render the scene for the animation.
    function render(jsonresponse, periodChunk) {
        // // Add animation frame to call render() about 30 times a second.
        // setTimeout(function() {
            
        // }, 0.00001);
        var renderedBorder = false;
        // console.log(jsonresponse[iterator]);
        while (jsonresponse[iterator] != null) {
            // Increment time in 100 steps per rotation.
            time += 1 / periodChunk;
            if (iterator % 48 == 0) {
                // console.log('iterator', iterator);

                var geometry = new THREE.CylinderGeometry( guiParams.radius - 2, guiParams.radius - 2, guiParams.velocity, 32);
                var material = new THREE.MeshPhongMaterial( {color: 0xffff00} );
                var cylinder = new THREE.Mesh( geometry, material );
                cylinder.material.color.setHex( Math.random() * 0xffffff);
                cylinder.material.transparent = true;
                cylinder.material.opacity = 0.3;
                cylinder.position.set(0, (guiParams.velocity * (iterator+1)/48) + (guiParams.velocity/2) , 0);
                cylinder.userData = jsonresponse[iterator];
                cylinders.push(cylinder);
                cylinder.name = "period";
                renderedBorder = true ;
            }
            // Calculate the current position.
            currentPosition = new THREE.Vector3(
                guiParams.radius*Math.cos(2*Math.PI*time),
                guiParams.velocity*time,
                guiParams.radius*Math.sin(2*Math.PI*time)
            );

            // Update position of sphere.
            // sphere.position.copy(currentPosition);

            // Draw a line from the previous position to the current possition.
            lineGeometry = new THREE.Geometry();
            //console.log('currentPosition', currentPosition);
            lineGeometry.vertices.push(lastPosition, currentPosition);
            line = new THREE.LineSegments(lineGeometry, material);
            // path.add(line);

            createBar(1, 0, 0xf9f9f9, currentPosition,jsonresponse[iterator]);

            if (periodChunk == 32) {
                console.log(time);
                if ((time * 32) % 32 == 30 ) {
                    console.log('yeees');
                    var timestamp = parseInt(jsonresponse[iterator].timestamp);
                    var date = new Date(timestamp);
                    date.setMonth(date.getMonth()+1);
                    date.setDate(0);
                    console.log(timestamp);
                    console.log(date);

                    if (date.getDate() == 31) {
                        // if month has 31 days generate bar
                        console.log('date has 31 days', date);

                        time += 1 / periodChunk;

                        currentPosition = new THREE.Vector3(
                            guiParams.radius*Math.cos(2*Math.PI*time),
                            guiParams.velocity*time,
                            guiParams.radius*Math.sin(2*Math.PI*time)
                        );
                        iterator = iterator + 1;
                        createBar(1, 0, 0xf9f9f9, currentPosition,jsonresponse[iterator]);       
                    } else {
                        // otherwise skip
                        time += 1 / periodChunk;
                    }
                    time += 1 / periodChunk;
                }
            }

            lastPosition = currentPosition;
            iterator = iterator + 1;
        }
    
        
        // update the picking ray with the camera and mouse position
            raycaster.setFromCamera( mouse, camera );
            controls.update();
        // }
        
        // Update the scene.
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    // Start animation.
}

// init();



// Create a function that is called whenever the window is resized.
window.addEventListener('resize', function() {

    
    console.log('window resized');
    var width = window.innerWidth, height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

});

function createBar(total, z, colour, position, data) {

if (data == null) {
    return;
}
for (var i = 0; i < total; i += 1) {

  var barHeigth = Math.trunc(data.value / 1000);
  var geometry = new THREE.BoxGeometry(2, barHeigth, 2);


  var color;
  if (barHeigth < 5) {
    color = 0xf44141;
  }
  else if (barHeigth >= 5 && barHeigth < 10) {
    color = 0xffA500;
  }
  else if (barHeigth >= 10 && barHeigth < 20) {
    color = 0x4167f4;
  }
  else {
    color = 0xe241f4;
  }
  
  var material = new THREE.MeshPhongMaterial({
    color: color
  });

  id = new THREE.Mesh(geometry, material);

  id.position.x = i * 5;
  id.name = iterator;
  id.userData = data;
  id.userData.color = color;

  scene.add(id);
  id.position.set(position.x,position.y + barHeigth/2,position.z);
  bars.push(id);

}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data-mod.json', true);



    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            
            callback(xobj.responseText);

        }
    }
    xobj.send(null);
}

function onDocumentMouseMove( event ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    event.preventDefault();
    
    $("#tooltip").css({"left": event.clientX + 10 , "top": event.clientY + 10 });

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var intersects = raycaster.intersectObjects( scene.children );

    if (intersects.length == 0 ){
        $("#tooltip").hide();
    } else {
        $("#tooltip").show();
    }
    for ( var i = 0; i < intersects.length; i++ ) {
        var date = new Date(parseInt(intersects[0].object.userData.timestamp));
        if (guiParams.dayView == true || intersects[0].object.name == "period") {
            $("#dateTooltip").text(date.toLocaleDateString());
        } else {
            $("#dateTooltip").text(date.toUTCString());
        }
        if (guiParams.dayView == false && intersects[0].object.name != "period") {
            var value = intersects[0].object.userData.value.toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              );
            $("#numberTooltip").text(value);
            $("#numberTooltipTitle").text("1/2 hour n/o passengers:");
            $("#avgPar").hide();
            $("#tooltip").css({"height": "120px"});
        } else {
            var avgvalue = intersects[0].object.userData.sum.toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              );
              var value = intersects[0].object.userData.value.toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              );
            $("#numberTooltip").text(avgvalue);
            $("#numberTooltipTitle").text("Total Number of passengers: ");
            $("#avgPar").show();
            $("#avgTooltip").text(value);
            $("#tooltip").css({"height": "150px"});
        }
    }
}
function onclick(event){

    console.log(selectedBars);

    var intersects = raycaster.intersectObjects( scene.children );

    console.log('intersects', intersects);
    for ( var i = 0; i < intersects.length; i++ ) {
        
        var position = new THREE.Vector3();
        position.getPositionFromMatrix( intersects[ i ].object.matrixWorld);
        console.log(position);
        console.log('clicked bar', intersects[ i ]);
    }
    
    if (INTERSECTED != intersects[0] && intersects[0].object.name != ""){
        // alert("Data on " + intersects[0].object.userData.timestamp + "\n number of idiots " + intersects[0].object.userData.value);
        guiParams.numberOfPassengers = intersects[0].object.userData.value;
        guiParams.date = intersects[0].object.userData.timestamp;
        $('#exampleInputEmail1').attr('value', intersects[0].object.userData.value);
        var timestamp = intersects[0].object.userData.timestamp;
        var date = new Date(parseInt(timestamp));
        console.log(intersects[0].object.userData.timestamp);
        console.log(date);
        $('#dateInput').attr('value', date.toUTCString());
    }
        

    INTERSECTED = intersects[0].object;
    var found = false;
    for (var i = selectedBars.length-1; i >= 0; i--) {
        console.log('in loop selectBars', selectedBars);
        if (selectedBars[i].name == INTERSECTED.name) {
            console.log('delete from selected');
            console.log('object removed');
            selectedBars.splice(i, 1);
            console.log('object before color change', intersects[0].object.material);
            var object = scene.getObjectByName( INTERSECTED.name, true );
            object.material.color.setHex(object.userData.color);
            console.log('object after color change', intersects[0].object.material);
            found = true;
            break;
        }
    }
    if (!found && intersects[0].object.name != ""){
        intersects[0].object.material.color.setHex( 0x53f442 );
        selectedBars.push(intersects[0].object);
    }

    console.log('selectBars in the end', selectedBars);    
}

$(function() {
    $('input[name="datetimes"]').daterangepicker({
      timePicker: true,
      timePicker24Hour: true,
    //   startDate: moment().startOf('hour'),
    //   endDate: moment().startOf('hour').add(32, 'hour'),
    startDate: moment("20140701", "YYYYMMDD"),
    endDate: moment("20150131", "YYYYMMDD"),
    minDate: moment("20140701", "YYYYMMDD"),
    maxDate: moment("20150131", "YYYYMMDD"),
      locale: {
        format: 'YY/MM/DD'
        
      }
    }, function(start, end, label) {
      console.log(start.unix());
      var timeZoneOffset = new Date().getTimezoneOffset() * 60;
      startTimestamp = (start.format('X') - timeZoneOffset) * 1000;
      endTimestamp = (end.format('X') - timeZoneOffset) * 1000;
      console.log(start);
      console.log(startTimestamp);
      var isFirstFocused = false;
      bars.forEach(bar => {
        if (bar.userData.timestamp >= startTimestamp && bar.userData.timestamp <= endTimestamp){
            bar.material.opacity = 1;
            if (!isFirstFocused){
                console.log('look at position', bar.position);
                // camera.lookAt(bar.position);
                // isFirstFocused = true;
                // controls.update();
            }
        } else {
            bar.material.transparent = true;
            bar.material.opacity = 0.15;
            // scene.remove(bar);
        }
    });
    });
  });
  $( function() {
    $( "#slider-range" ).slider({
        range: true,
        min: 0,
        max: 40000,
        values: [ 0, 14000 ],
        slide: function( event, ui ) {
            var bottom = ui.values[0];
            var top = ui.values[1];
            bars.forEach(bar => {
                if (bar.userData.value >= bottom && bar.userData.value <= top){
                    bar.material.opacity = 1;
                } else {
                    bar.material.transparent = true;
                    bar.material.opacity = 0.2;
                    // scene.remove(bar);
                }
            });
        }
    });
    $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
        " - $" + $( "#slider-range" ).slider( "values", 1 ) );
    });

  function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}
  function mergeJsons(meanArray, sumArray) {
    for (var i = 0; i < meanArray.length; i++) {
         meanArray[i]['sum'] = sumArray[i]['value'];
      }
  }
  function mergeData(dataArray, sumArray) {
    for (var i = 0; i < sumArray.length; i++) {
        dataArray.forEach(function(element) {
            if (element.timestamp == sumArray[i].timestamp){
                element['sum'] = sumArray[i].value;
            }
          });
    }
}