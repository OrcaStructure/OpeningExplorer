import Chess from "chess.js";
import { useState, useRef, useEffect } from "react";
import Chessground from "react-chessground";
import "react-chessground/dist/styles/chessground.css";
import "./chess.css";
import "./styles.css";
import "./theme.css";
import toDests from "./to-dests";

export default function Chessboard({ onReset, onFlip, onToggleMode }) {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [orientation, setOrientation] = useState("white"); // Board orientation
  const [mode, setMode] = useState(false); // Boolean to represent mode
  const chess = new Chess(fen);
  const turnColor = chess.turn() === "w" ? "white" : "black";

  const boardRef = useRef(null);
  const [boardSize, setBoardSize] = useState(512); // Default size

  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        const newSize = Math.min(boardRef.current.offsetWidth, 512); // Cap size at 512px
        setBoardSize(newSize);
      }
    };

    handleResize(); // Call it once on mount
    window.addEventListener("resize", handleResize); // Update size on window resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMove = (from, to) => {
    chess.move({ from, to });
    setFen(chess.fen());
  };

  // Reset the game
  const resetGame = () => {
    chess.reset();
    setFen(chess.fen());
  };

  // Flip the board orientation
  const flipBoard = () => {
    setOrientation((prevOrientation) =>
      prevOrientation === "white" ? "black" : "white"
    );
  };

  // Toggle mode (you can define what the mode does)
  const toggleMode = () => {
    setMode((prevMode) => !prevMode); // Flip between true and false
  };

  // Expose reset, flip, and mode toggle functions to the parent
  useEffect(() => {
    if (onReset) onReset(resetGame);
    if (onFlip) onFlip(flipBoard);
    if (onToggleMode) onToggleMode(toggleMode);
  }, [onReset, onFlip, onToggleMode]);

  return (
    <div
      className="chessboard-container"
      ref={boardRef}
      style={{
        width: "100%",
        maxWidth: "512px",
        margin: "20px auto",
        padding: "10px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <Chessground
        fen={fen}
        turnColor={turnColor}
        onMove={handleMove}
        movable={toDests(chess)}
        orientation={orientation} // Dynamic orientation (flipping the board)
        width={boardSize}
        height={boardSize}
      />
      {/* Optionally show mode status for debugging */}
      <p>Current Mode: {mode ? "Mode 1" : "Mode 2"}</p>
    </div>
  );
}
