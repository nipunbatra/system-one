import type { OpenSlideConfig } from '@open-slide/core';

// GitHub Pages serves the site under /system-one/; local dev stays at /.
const openSlideConfig: OpenSlideConfig = {
  base: process.env.OSD_BASE ?? '/',
};

export default openSlideConfig;
