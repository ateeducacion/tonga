// Look of the selection handles: Tonga's accent colour, filled handles big enough for touch, and
// a round rotation handle, as in most editors, so it does not look like a resize handle.
import { controlsUtils, InteractiveFabricObject } from 'fabric';

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
  const rotate = controls.mtr;
  if (rotate) {
    rotate.render = controlsUtils.renderCircleControl;
    rotate.sizeX = 16;
    rotate.sizeY = 16;
    rotate.offsetY = -30;
    rotate.withConnection = true;
    rotate.cursorStyle = 'grab';
  }
  return { controls };
};
