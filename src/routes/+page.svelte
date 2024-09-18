<script lang="ts">
    import io from 'socket.io-client'

    const socket = io('http://192.168.3.17:4001')

    socket.on('connect', () => {
        console.log('connected')
    })

    socket.on('disconnect', () => {
        console.log('disconnected')
    })
</script>