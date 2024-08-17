rm -rf out
mkdir out
# emcc -o out/libfvad.js -s MODULARIZE=1 -s EXPORT_NAME="LibFvadModule" -s ENVIRONMENT="web,worker" -I./include ./deps/libfvad/src/fvad.c -O3
emcc \
	-s WASM=1 \
	-s STANDALONE_WASM=1 \
	--no-entry \
	-Oz \
	-D NDEBUG \
	-I ./deps/libfvad/include \
	./deps/libfvad/src/fvad.c \
	./deps/libfvad/src/signal_processing/*.c \
	./deps/libfvad/src/vad/*.c \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="LibFvadModule" \
    -s ENVIRONMENT="node" \
    -s EXPORT_ES6=1 \
	-s EXPORTED_FUNCTIONS="['_fvad_new', '_fvad_free', '_fvad_reset', '_fvad_set_mode', '_fvad_set_sample_rate', '_fvad_process', '_malloc', '_free']" \
	-o ./out/libfvad.js

deno run -A scripts/monkey-patch.ts