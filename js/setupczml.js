function pushCZMLProcessors() {
    // got this from https://groups.google.com/forum/#!searchin/cesium-dev/custom$20czml$20properties|sort:relevance/cesium-dev/Y7TYqLBKVTw/d8M60oAIaisJ
    function processDataVol(entity, packet, entityCollection, sourceUri) {
      var customPropertyData = packet.datavol;

      var customProperty = entity.datavol;
      if (customProperty === undefined) {
        entity.addProperty('datavol');
      }

      // this is on line 104382 in Cesium.js
      Cesium.CzmlDataSource.processPacketData(Number, entity, 'datavol', customPropertyData, undefined, sourceUri, entityCollection);
    }

    Cesium.CzmlDataSource.updaters.push(processDataVol);


    function processGSavail(entity, packet, entityCollection, sourceUri) {
      var customPropertyData = packet.gs_availability;

      var customProperty = entity.gs_availability;
      if (customProperty === undefined) {
        entity.addProperty('gs_availability');
      }

      // this is on line 104382 in Cesium.js
      Cesium.CzmlDataSource.processPacketData(Boolean, entity, 'gs_availability', customPropertyData, undefined, sourceUri, entityCollection);
    }

    Cesium.CzmlDataSource.updaters.push(processGSavail);


    function processBattery(entity, packet, entityCollection, sourceUri) {
      var customPropertyData = packet.battery;

      var customProperty = entity.battery;
      if (customProperty === undefined) {
        entity.addProperty('battery');
      }

      // this is on line 104382 in Cesium.js
      Cesium.CzmlDataSource.processPacketData(Number, entity, 'battery', customPropertyData, undefined, sourceUri, entityCollection);
    }

    Cesium.CzmlDataSource.updaters.push(processBattery);


    function processEclipses(entity, packet, entityCollection, sourceUri) {
      var customPropertyData = packet.eclipse;

      var customProperty = entity.eclipse;
      if (customProperty === undefined) {
        entity.addProperty('eclipse');
      }

      // this is on line 104382 in Cesium.js
      Cesium.CzmlDataSource.processPacketData(Boolean, entity, 'eclipse', customPropertyData, undefined, sourceUri, entityCollection);
    }

    Cesium.CzmlDataSource.updaters.push(processEclipses);



    function processDataRate(entity, packet, entityCollection, sourceUri) {
      var customPropertyData = packet.datarate;

      var customProperty = entity.datarate;
      if (customProperty === undefined) {
        entity.addProperty('datarate');
      }

      // this is on line 104382 in Cesium.js
      Cesium.CzmlDataSource.processPacketData(Number, entity, 'datarate', customPropertyData, undefined, sourceUri, entityCollection);
    }

    Cesium.CzmlDataSource.updaters.push(processDataRate);


    // For processing proxy position - which can be used to add an arbitrary position value to any czml packet
    function processPositionProxy(entity, packet, entityCollection, sourceUri) {
      var customPropertyData = packet.position_proxy;

      var customProperty = entity.position_proxy;
      if (customProperty === undefined) {
        entity.addProperty('position_proxy');
      }

      // this is on line 104542 in Cesium.js
      Cesium.CzmlDataSource.processPositionPacketData(entity, 'position_proxy', customPropertyData, undefined, sourceUri, entityCollection);
    }

    Cesium.CzmlDataSource.updaters.push(processPositionProxy);
}

/*
Creates rotation matrix from inertial to sat RF (where sat reference frame has x pointed nader, z axis pointed along velocity, and y crosstrack to complete right handed ref frame)
*/
function getSatNadirRotation(sat_position,vel_unit_vec) {

    var nadir_dir = Cesium.Cartesian3.negate(sat_position,new Cesium.Cartesian3());
    var x_norm = Cesium.Cartesian3.normalize(nadir_dir,new Cesium.Cartesian3());

    // get y and z axes.
    var y_direction = Cesium.Cartesian3.cross(vel_unit_vec, x_norm, new Cesium.Cartesian3());
    var y_norm = Cesium.Cartesian3.normalize(y_direction,new Cesium.Cartesian3());

    var z_direction = Cesium.Cartesian3.cross(x_norm, y_norm, new Cesium.Cartesian3());
    var z_norm = Cesium.Cartesian3.normalize(z_direction,new Cesium.Cartesian3());

    // now create rotation matrix. Each direction vector goes in a single row, for x,y,z components of our new nadir frame
    result = new Cesium.Matrix3();
    result[0] = x_norm.x;
    result[1] = x_norm.y;
    result[2] = x_norm.z;
    result[3] = y_norm.x;
    result[4] = y_norm.y;
    result[5] = y_norm.z;
    result[6] = z_norm.x;
    result[7] = z_norm.y;
    result[8] = z_norm.z;

    return result;
}

/*
    Draws a sat reference frame at Cartesian3 sat position, with orientation specified by Matrix2 rotation (rotation from inertial to sat RF)

    Returns a Cartesian3 with the direction of the x-axis of the ref frame
*/
function drawRefFrame(sat_pos,rotation) {
    // Code for drawing nadir axis system, when desired

    var temp1 = new Cesium.Cartesian3(1,0,0);
    var out1 = Cesium.Matrix3.multiplyByVector(rotation, temp1, new Cesium.Cartesian3());
    var temp2 = new Cesium.Cartesian3(0,1,0);
    var out2 = Cesium.Matrix3.multiplyByVector(rotation, temp2, new Cesium.Cartesian3());
    var temp3 = new Cesium.Cartesian3(0,0,1);
    var out3 = Cesium.Matrix3.multiplyByVector(rotation, temp3, new Cesium.Cartesian3());
    // console.log(sat_pos.toString());
    // console.log(rotation.toString());
    // console.log(out.toString());

    var point1 = sat_pos;

    // 1000 km long vector in nadir direction
    var dirvec = Cesium.Cartesian3.multiplyByScalar(out1, 1000000, new Cesium.Cartesian3());

    var point2 = Cesium.Cartesian3.add(point1,dirvec,new Cesium.Cartesian3());

    var vector1 = viewer.entities.add({
        polyline : {
            positions : [point1, point2],
            followSurface: false,
            width : 2,
            material : Cesium.Color.BLUE
        }
    });

    // 1000 km long vector in "y" direction
    var dirvec = Cesium.Cartesian3.multiplyByScalar(out2, 1000000, new Cesium.Cartesian3());

    var point2 = Cesium.Cartesian3.add(point1,dirvec,new Cesium.Cartesian3());

    var vector1 = viewer.entities.add({
        polyline : {
            positions : [point1, point2],
            followSurface: false,
            width : 2,
            material : Cesium.Color.RED
        }
    });

    // 1000 km long vector in "z" direction
    var dirvec = Cesium.Cartesian3.multiplyByScalar(out3, 1000000, new Cesium.Cartesian3());

    var point2 = Cesium.Cartesian3.add(point1,dirvec,new Cesium.Cartesian3());

    var vector1 = viewer.entities.add({
        polyline : {
            positions : [point1, point2],
            followSurface: false,
            width : 2,
            material : Cesium.Color.LIME
        }
    });

    return out1;
}

function getRotationInertialtoSat(sat,time) {
    var sat_pos = sat.position.getValue(time);

    now = Cesium.JulianDate.clone(time,new Cesium.JulianDate());

    // have to grab an old position, to diff the positions and get a velocity vector.
    old_time = Cesium.JulianDate.addSeconds(now,-10,new Cesium.JulianDate());
    var sat_pos_old = sat.position.getValue(old_time);

    rough_vel = undefined;
    if (sat_pos_old === undefined) {
        console.log('setupczml.js: position at -10 sec doesnt exist! Going forward 10 sec instead');

        // position doesn't exist at -10 seconds, likely because this is one of the very first data points in the scenario. We'll get around that for now by looking forward 10 sec instead
        new_time = Cesium.JulianDate.addSeconds(now,10,new Cesium.JulianDate());
        var sat_pos_new = sat.position.getValue(new_time);

        if (sat_pos_old === undefined) {
            console.log('setupczml.js: position at +10 sec doesnt exist either! Cant determine orientation');
        }
        rough_vel = Cesium.Cartesian3.subtract(sat_pos_new,sat_pos,new Cesium.Cartesian3());
    }
    else {
        rough_vel = Cesium.Cartesian3.subtract(sat_pos,sat_pos_old,new Cesium.Cartesian3());
    }

    var vel_unit = Cesium.Cartesian3.normalize(rough_vel,new Cesium.Cartesian3());

    return getSatNadirRotation(sat_pos,vel_unit);
}

function orientationCallback(time, result) {
    // "result" is just an object that CAN contain the result if desired. Not using.
    // "this" refers to the satellite object

    // console.log('orientation for '+this.id.toString());

    rotation_inertial_to_sat = getRotationInertialtoSat(this,time);

    // rotate sat RF so that z axis is pointed toward nadir. All agi_* sensors are oriented along z axis. Note from cesium-sensor-volumes.js: "in it's coordinates, the sensor's principal direction is along the positive z-axis."
    var yrotation = Cesium.Matrix3.fromRotationY(Math.PI/2, new Cesium.Matrix3());
    var rotation_satxnadir_to_satznadir = Cesium.Matrix3.multiply( rotation_inertial_to_sat, yrotation, new Cesium.Matrix3())

    return Cesium.Quaternion.fromRotationMatrix(rotation_satxnadir_to_satznadir, new Cesium.Quaternion()) ;
}

function drawNadirRFCallback() {
    // "this" refers to the satellite object

    var time = viewer.clock.currentTime;

    rotation_inertial_to_sat = getRotationInertialtoSat(this,time);

    var sat_pos = this.position.getValue(time);

    var nadir_dir = drawRefFrame(sat_pos,rotation_inertial_to_sat);

    return nadir_dir;
}


/**
     * Adds custom callback functions that specify the orientation value for the satellite - always returns nadir direction for now
     *
     */
function addCallbacks(dataSource,viz_objects_json) {
    // Rules for callback properties:
    // second argument false means it's not constant

    // Add orientation callback
    for (let sat_name of viz_objects_json.callbacks.orientation) {
        var sat = dataSource.entities.getById(sat_name);
        console.log('adding orientation callback to: '+sat.id.toString());

        // Add orientation callback property
        // Need to use bind to specify the object "sat" as the one to be used for "this" in orientationCallback
        sat.orientation = new Cesium.CallbackProperty(orientationCallback.bind(sat), false);
    }


    // Add nadir ref frame drawing callback property
    for (let sat_name of viz_objects_json.callbacks.drawNadirRF) {
        var sat = dataSource.entities.getById(sat_name);
        console.log('adding drawNadirRF callback to: '+sat.id.toString());
        console.log('to draw local reference frame for a sat:');
        console.log('var b = ar.resolveEntity(\'Satellite/0\')');
        console.log('b.drawNadirRF._callback()');

        sat.drawNadirRF = new Cesium.CallbackProperty(drawNadirRFCallback.bind(sat), false);
    }

    return dataSource;
}

function setDPI(canvas, dpi) {
    // Set up CSS size if it's not set up already
    if (!canvas.style.width)
        canvas.style.width = canvas.width + 'px';
    if (!canvas.style.height)
        canvas.style.height = canvas.height + 'px';

    var scaleFactor = dpi / 96;
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
}