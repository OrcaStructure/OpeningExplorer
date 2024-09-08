"use client"; 
import Chess from "chess.js";
import { useState, useRef, useEffect } from "react";
import Chessground from "react-chessground";
import "react-chessground/dist/styles/chessground.css";
import "./chess.css";
import "./styles.css";
import "./theme.css";
import toDests from "./to-dests";

var stockfishWorker;

if (typeof window !== "undefined") {
    stockfishWorker = new Worker('stockfish.js');
    var currentEval = 0
    stockfishWorker.postMessage("uci");
    stockfishWorker.postMessage("ucinewgame");
}
    
export default function Chessboard({ onReset, onFlip, onToggleMode, onGetPgn, setEvaluation }) {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [orientation, setOrientation] = useState("white"); // Board orientation
  const [mode, setMode] = useState(false); // Boolean to represent mode

  const chessRef = useRef(new Chess(fen)); // Persist the chess instance across renders

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

         

    const handleWorkerMessage = (e) => {
        e = e.data
      if (e && typeof e === 'string' && e.includes('info depth 16')) {
    // Extract evaluation from the info string
          console.log(e, "data")
    const evaluationMatch = e.match(/score cp (-?\d+)/);
    
        
    if (evaluationMatch) {
    var multiplier = -1 * (chessRef.current.turn() == "w" ? 1 : -1)
      currentEval = multiplier * parseInt(evaluationMatch[1], 10) / 100;
    }
           
    }
    };
    
    if (typeof window !== "undefined") {
        stockfishWorker.onmessage = handleWorkerMessage;
    }
    
  const handleMove = (from, to) => {
    chessRef.current.move({ from, to });
    console.log("Moved:", chessRef.current.pgn());
    setFen(chessRef.current.fen());

    // Calculate evaluation after each move (you can replace this with your actual logic)
    const evaluation = calculateEvaluation(chessRef.current);
    setEvaluation(evaluation); // Pass evaluation to the parent component

    turnColor = chessRef.current.turn() === "w" ? "white" : "black";
    
    if (mode == 1) {
      tryAutomaticMove();
    }
    
    if (typeof window !== "undefined") {
        stockfishWorker.postMessage("go depth 20");
        stockfishWorker.postMessage("position fen " + chessRef.current.fen());
    }
  };

  // Example function to calculate evaluation (replace with actual logic)
  const calculateEvaluation = (chessInstance) => {
    return currentEval
  };

  const tryAutomaticMove = () => {
           console.log(orientation,turnColor)
    if (orientation !== turnColor) {
        console.log("yes")
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
        turnColor = chessRef.current.turn() === "w" ? "white" : "black"
      tryAutomaticMove();
    }
  };
    
 useEffect(() => {
     

  // Set up interval to update evaluation every 0.2 seconds
  const intervalId = setInterval(() => {
    const evaluation = calculateEvaluation(chessRef.current);
    setEvaluation(evaluation); // Update evaluation every 0.2 seconds
  }, 200);

  // Expose reset, flip, and mode toggle functions to the parent
  if (onReset) onReset(resetGame);
  if (onFlip) onFlip(flipBoard);
  if (onToggleMode) onToggleMode(toggleMode);
  if (onGetPgn) onGetPgn(getPgn);

  // Clean up the interval on component unmount
  return () => clearInterval(intervalId);
}, [onReset, onFlip, onToggleMode, onGetPgn, setEvaluation]); // Dependencies


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
