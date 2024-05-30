<script lang="ts">
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import { addDoc, collection } from 'firebase/firestore';

	let count: number = 0;
    let userName: string = "";
	/**
	 * @type {{ writeValue: (arg0: Uint8Array) => void; }}
	 */
	let characteristic: { writeValue: (arg0: Uint8Array) => void; };

	function connectToBluetooth() {
		navigator.bluetooth.requestDevice({
			filters: [{ services: ['battery_service'] }]
		}).then((device: { gatt: { connect: () => any; }; }) => {
			return device.gatt.connect();
		}).then((server: { getPrimaryService: (arg0: string) => any; }) => {
			return server.getPrimaryService('battery_service');
		}).then((service: { getCharacteristic: (arg0: string) => any; }) => {
			return service.getCharacteristic('battery_level');
		}).then((characteristic: { startNotifications: () => void; addEventListener: (arg0: string, arg1: (event: { target: { value: { getUint8: (arg0: number) => any; }; }; }) => void) => void; }) => {
			characteristic.startNotifications();
			characteristic.addEventListener('characteristicvaluechanged', handleValueChanged);
		}).catch((error: any) => {
			console.log('Error:', error);
		});
	}

	/**
	 * @param {{ target: { value: { getUint8: (arg0: number) => any; }; }; }} event
	 */
	function handleValueChanged(event: { target: { value: { getUint8: (arg0: number) => any; }; }; }) {
		const value = event.target.value.getUint8(0);
		if (value === 'r') {
			count = 0;
		} else {
			count++;
		}
	}

	function resetCount() {
		count = 0;
		// リセットコマンドを送信
		const resetCommand = new TextEncoder().encode('r'); // 文字列をUint8Arrayに変換
		characteristic.writeValue(resetCommand);
	}

	function sendDataToFirebase() {
        if (userName === "") {
            alert("Please enter your name.");
            return;
        }
		addDoc(collection(db, 'count'), { count });
	}
</script>

<main>
	<h1>Count: {count}</h1>
	<button on:click={connectToBluetooth}>Connect to Bluetooth</button>
	<button on:click={resetCount}>Reset Count</button>
	<button on:click={sendDataToFirebase}>Send Data to Firebase</button>
    <input type="text" bind:value={userName} placeholder="Enter your name" />
</main>

