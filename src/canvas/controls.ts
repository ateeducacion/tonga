// Look of the selection handles: Tonga's accent colour, filled handles big enough for touch, and
// a round rotation handle, as in most editors, so it does not look like a resize handle.
import { controlsUtils, InteractiveFabricObject, type Control } from 'fabric';

const ACCENT = '#b9480f';

InteractiveFabricObject.ownDefaults = {
  ...InteractiveFabricObject.ownDefaults,
  transparentCorners: false,
  cornerColor: '#ffffff',
  cornerStrokeColor: ACCENT,
  borderColor: ACCENT,
  borderScaleFactor: 1.5,
  cornerSize: 11,
  touchCornerSize: 28,
  padding: 2,
};

const defaultControls = InteractiveFabricObject.createControls;
InteractiveFabricObject.createControls = () => {
  const { controls } = defaultControls();
  // mtr is always among Fabric's default controls.
  Object.assign(controls.mtr as Control, {
    render: controlsUtils.renderCircleControl,
    sizeX: 16,
    sizeY: 16,
    offsetY: -30,
    withConnection: true,
    cursorStyle: 'grab',
  });
  return { controls };
};
