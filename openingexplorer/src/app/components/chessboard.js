import Chess from "chess.js";
import { useState, useRef, useEffect } from "react";
import Chessground from "react-chessground";
import "react-chessground/dist/styles/chessground.css";
import "./chess.css";
import "./styles.css";
import "./theme.css";
import toDests from "./to-dests";

export default function Chessboard({ onReset, onFlip, onToggleMode, onGetPgn }) {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [orientation, setOrientation] = useState("white"); // Board orientation
  const [mode, setMode] = useState(false); // Boolean to represent mode
  
  // Use useRef to persist the chess instance across renders
  const chessRef = useRef(new Chess(fen));

  const getPgn = () => {
    const pgnString = chessRef.current.pgn();
    console.log("Generated PGN:", pgnString);
    return pgnString;
  };

  var turnColor = chessRef.current.turn() === "w" ? "white" : "black";

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
    chessRef.current.move({ from, to });
    console.log("Moved:", chessRef.current.pgn());
    setFen(chessRef.current.fen());
    turnColor = chessRef.current.turn() === "w" ? "white" : "black";

    if (mode === 1) {
      tryAutomaticMove();
    }
  };

  const tryAutomaticMove = () => {
    if (orientation !== turnColor) {
      requestMove();
    }
  };

  const requestError = (response) => {
    throw new Error("Network response was not ok " + response.statusText);
  };

  const filterMoves = (explorerMoves) => {
    var probabilities = [];
    var makeableMoves = [];
    var numberOfGames =
      explorerMoves.white + explorerMoves.black + explorerMoves.draws;
    if (numberOfGames < 5) {
      console.log("No more games");
      return;
    }

    for (var i = 0; i < explorerMoves.moves.length; i++) {
      probabilities.push(
        (explorerMoves.moves[i].white +
          explorerMoves.moves[i].black +
          explorerMoves.moves[i].draws) /
          (explorerMoves.white + explorerMoves.black + explorerMoves.draws)
      );
      makeableMoves.push(explorerMoves.moves[i].uci);
      if (
        explorerMoves.moves[i].san === "O-O" ||
        explorerMoves.moves[i].san === "O-O-O"
      ) {
        switch (makeableMoves[i]) {
          case "e1h1":
            makeableMoves[i] = "e1g1";
            break;
          case "e1a1":
            makeableMoves[i] = "e1c1";
            break;
          case "e8a8":
            makeableMoves[i] = "e8c8";
            break;
          case "e8h8":
            makeableMoves[i] = "e8g8";
            break;
          default:
            break;
        }
      }
    }
    return [makeableMoves, probabilities];
  };

  function chooseRandomFrom(items, weights) {
    for (let i = 1; i < weights.length; i++) weights[i] += weights[i - 1];

    const random = Math.random() * weights[weights.length - 1];

    for (let i = 0; i < weights.length; i++)
      if (weights[i] > random) return items[i];
  }

  const formatMove = (chosenMove) => {
    return {
      from: chosenMove.slice(0, 2),
      to: chosenMove.slice(2, 4),
      promotion: "q", // always promote to a queen for simplicity
    };
  };

  const requestMove = () => {
    fetch(
      `https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=1800,2000,2200,2500&fen=${chessRef.current
        .fen()
        .replaceAll(" ", "%20")}&topGames=0&recentGames=0`
    )
      .then((response) => {
        if (!response.ok) {
          requestError(response);
        }
        return response.json();
      })
      .then((explorerMoves) => {
        const [makeableMoves, probabilities] = filterMoves(explorerMoves);

        const chosenMove = chooseRandomFrom(makeableMoves, probabilities);
        const formattedMove = formatMove(chosenMove);
        handleMove(formattedMove.from, formattedMove.to);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation: ", error);
      });
  };

  // Reset the game
  const resetGame = () => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
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
    if (!mode) {
      tryAutomaticMove();
    }
  };

  // Expose reset, flip, and mode toggle functions to the parent
  useEffect(() => {
    if (onReset) onReset(resetGame);
    if (onFlip) onFlip(flipBoard);
    if (onToggleMode) onToggleMode(toggleMode);
    if (onGetPgn) onGetPgn(getPgn);
  }, [onReset, onFlip, onToggleMode, onGetPgn]);

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
        movable={toDests(chessRef.current)}
        orientation={orientation} // Dynamic orientation (flipping the board)
        width={boardSize}
        height={boardSize}
      />
      {/* Optionally show mode status for debugging */}
      <p>Current Mode: {mode ? "Vs Database" : "Edit Position"}</p>
    </div>
  );
}