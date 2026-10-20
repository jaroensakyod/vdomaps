import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
// Draw frames on the GPU. Measured on an RTX 2060 / i7-10875H, 150 frames of a map scene:
// default (software) 49.8 s · angle 37 s · vulkan 13.1 s, same image (PSNR 42 dB). Machines without a working
// Vulkan driver: remove this line (or pass --gl=angle / --gl=swangle on the command line).
Config.setChromiumOpenGlRenderer("vulkan");
// Half the threads: with vulkan, 50% was as fast as 75–100% and leaves the machine usable.
Config.setConcurrency("50%");
