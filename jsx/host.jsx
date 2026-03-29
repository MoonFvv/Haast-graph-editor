/**
 * Haast Flow Editor - ExtendScript host
 * Runs inside After Effects via CSInterface.evalScript()
 * Target: After Effects CS6+ (ExtendScript / ES3)
 */

/**
 * Converts a CSS cubic-bezier control point (0..1 range, x-clamped)
 * into an AE TemporalEasePoint.
 * AE uses influence 0-100 (percent of keyframe span) and speed.
 *
 * @param {number} x1  - handle 1 x (time)
 * @param {number} y1  - handle 1 y (value)
 * @param {number} x2  - handle 2 x (time)
 * @param {number} y2  - handle 2 y (value)
 * @param {number} inInfluence  - in-tangent influence percent (1-100)
 * @param {number} outInfluence - out-tangent influence percent (1-100)
 */
function applyBezierToSelectedKeyframes(x1, y1, x2, y2, inInfluence, outInfluence) {
  try {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
      return 'noComposition';
    }

    var appliedCount = 0;

    // Iterate selected properties in the active composition
    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);
      if (!layer.selected) continue;

      // Walk all properties on the layer
      applyToPropertyGroup(layer, x1, y1, x2, y2, inInfluence, outInfluence);
    }

    // Count applied keyframes across all selected layers
    // If nothing was selected by layer, try timeline selection
    appliedCount = applyToActiveCompositionSelection(comp, x1, y1, x2, y2, inInfluence, outInfluence);

    if (appliedCount === 0) {
      return 'noKeyframes';
    }

    return 'success:' + appliedCount;
  } catch (e) {
    return 'Error: ' + e.toString();
  }
}

/**
 * Recursively walk a property group and apply bezier to selected keyframes.
 */
function applyToPropertyGroup(group, x1, y1, x2, y2, inInfluence, outInfluence) {
  var count = 0;
  try {
    for (var i = 1; i <= group.numProperties; i++) {
      var prop = group.property(i);
      if (prop.numProperties > 0) {
        count += applyToPropertyGroup(prop, x1, y1, x2, y2, inInfluence, outInfluence);
      } else if (prop.numKeys > 0) {
        count += applyBezierToProperty(prop, x1, y1, x2, y2, inInfluence, outInfluence);
      }
    }
  } catch (e) {
    // Skip properties that don't support keyframe manipulation
  }
  return count;
}

/**
 * Apply bezier easing to selected keyframes on a property.
 * Uses TemporalEase for speed-based bezier approximation.
 */
function applyBezierToProperty(prop, x1, y1, x2, y2, inInfluence, outInfluence) {
  var count = 0;
  try {
    if (prop.numKeys < 2) return 0;

    for (var k = 1; k <= prop.numKeys; k++) {
      if (!prop.keySelected(k)) continue;

      var keyInterp = prop.keyOutInterpolationType(k);

      // Only modify bezier-capable keyframes
      // Set both in and out to BEZIER
      try {
        prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
      } catch (e) {
        // Some properties may not support BEZIER, skip
        continue;
      }

      // Build temporal ease objects
      // AE TemporalEase: influence (0-100%), speed
      var outEase = new KeyframeEase(0, outInfluence);
      var inEase  = new KeyframeEase(0, inInfluence);

      try {
        // Apply out ease to this keyframe
        prop.setTemporalEaseAtKey(k, [outEase], [inEase]);
        count++;
      } catch (e) {
        // Try with multi-value property (e.g. position)
        try {
          var dims = prop.value.length;
          if (dims) {
            var outEases = [];
            var inEases  = [];
            for (var d = 0; d < dims; d++) {
              outEases.push(new KeyframeEase(0, outInfluence));
              inEases.push(new KeyframeEase(0, inInfluence));
            }
            prop.setTemporalEaseAtKey(k, outEases, inEases);
            count++;
          }
        } catch (e2) {
          // Cannot apply to this keyframe
        }
      }

      // Apply spatial bezier for position/path properties
      try {
        if (prop.isSpatial) {
          // Set spatial tangents to approximate the bezier curve
          // For simplicity, use auto-bezier tangents and let
          // temporal ease carry the easing character
          var spatialIn  = prop.keyInSpatialTangent(k);
          var spatialOut = prop.keyOutSpatialTangent(k);

          // Scale tangents by influence to approximate bezier feel
          var scale = outInfluence / 33.0;
          if (spatialOut && spatialOut.length > 0) {
            var scaledOut = [];
            for (var di = 0; di < spatialOut.length; di++) {
              scaledOut.push(spatialOut[di] * scale);
            }
            prop.setSpatialTangentsAtKey(k, spatialIn, scaledOut);
          }
        }
      } catch (e) {
        // Spatial tangents not available for this property
      }
    }
  } catch (e) {
    // Property doesn't support keyframe operations
  }
  return count;
}

/**
 * Try to apply easing to all selected keyframes across all layers in the comp.
 * This handles the case when the user has selected keyframes in the timeline
 * but may not have the layer itself selected.
 */
function applyToActiveCompositionSelection(comp, x1, y1, x2, y2, inInfluence, outInfluence) {
  var count = 0;
  try {
    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);
      count += applyToPropertyGroup(layer, x1, y1, x2, y2, inInfluence, outInfluence);
    }
  } catch (e) {
    // Ignore
  }
  return count;
}
