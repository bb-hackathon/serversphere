ALIAS = oracular
IMAGE = ${ALIAS}-server-cloudimg-amd64.img

fetch-img:
	wget https://cloud-images.ubuntu.com/${ALIAS}/current/${IMAGE}

vm:
	cp ${IMAGE} hda.img --force --verbose
	qemu-img resize ./hda.img 10G
	qemu-system-x86_64     \
    -net nic               \
    -net user              \
    -machine accel=kvm:tcg \
    -m 512                 \
    -nographic             \
    -hda ./hda.img         \
    -smbios type=1,serial=ds='nocloud;s=http://10.0.2.2:8000/'

serve:
	python3 -m http.server --directory .
