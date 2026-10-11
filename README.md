# 栖居 · DWELL

A minimal bilingual-subtitled documentary player. Public page: https://shen112s.github.io/dwell-player/

Video and AAC audio are stream-copied from the supplied MP4, with no re-encoding, resizing or frame-rate conversion. HLS fragmented-MP4 files live on the `media` branch. The `main` branch contains only the small website, so GitHub Pages does not publish the multi-gigabyte media tree.

The page requests no video or HLS library until the viewer chooses Play. Safari can use its native HLS player. Other compatible browsers load the locally vendored hls.js light build, with an 8-second forward-buffer target, 12-second maximum target and 4-second back buffer. These are buffer settings, not a guarantee on total browser process memory. Pausing stops further HLS.js downloads; browsers manage native playback buffering themselves.

Original media: H.264 Main, 1920×1080, 60000/1001 fps; AAC stereo; 1185.234 seconds; about 38 Mbps. Sustained playback requires download throughput above the original bitrate. GitHub delivery speed and regional accessibility can vary.

hls.js 1.7.3 is distributed under its bundled Apache-2.0 license. The film is not covered by the player library license.
