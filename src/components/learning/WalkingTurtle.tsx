
// 3D Walking Turtle Component
const WalkingTurtle = ({ isWalking }: { isWalking: boolean }) => (
    <div className="relative flex items-center justify-center w-12 h-12" style={{ perspective: '100px' }}>
        <motion.div
            animate={isWalking ? {
                rotateX: [0, 10, 0, 10, 0], // Tilt forward/back
                rotateZ: [0, -10, 10, -10, 0], // Waddle left/right
                y: [0, -4, 0, -4, 0], // Hop up/down
                scale: [1, 1.1, 1, 1.1, 1] // Squish effect
            } : {
                rotateX: 0,
                rotateZ: 0,
                y: 0,
                scale: 1
            }}
            transition={isWalking ? {
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
            } : { duration: 0.3 }}
            className="text-3xl z-10 filter drop-shadow-md origin-bottom transform-style-3d"
        >
            🐢
        </motion.div>
        {/* Dynamic Shadow for 3D feel */}
        {isWalking && (
            <motion.div
                animate={{ scale: [1, 0.6, 1, 0.6, 1], opacity: [0.3, 0.1, 0.3, 0.1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1 w-8 h-2 bg-black/20 rounded-full blur-[2px]"
            />
        )}
    </div>
);
