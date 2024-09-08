"use client"; 
import { useState, useRef } from "react";
import { Modal, Button, Grid, ScrollArea, Text, Card, Title } from "@mantine/core";
import Chessboard from "../components/chessboard.js";
import styles from "./page.module.css";

const Home = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [pgn, setPgn] = useState(""); // State to store the PGN string
  const [evaluation, setEvaluation] = useState(0); // State to store evaluation

  const resetRef = useRef(null);
  const flipRef = useRef(null);
  const toggleModeRef = useRef(null);
  const pgnRef = useRef(null);

  const handleReset = () => {
    if (resetRef.current) {
      resetRef.current();
    }
  };

  const handleFlip = () => {
    if (flipRef.current) {
      flipRef.current();
    }
  };

  const handleToggleMode = () => {
    if (toggleModeRef.current) {
      toggleModeRef.current();
    }
  };

  const handleOpenModal = () => {
    if (pgnRef.current) {
      const currentPgn = pgnRef.current(); // Get PGN from the chessboard component
      setPgn(currentPgn); // Set PGN in the state
      setModalOpened(true); // Open modal
    } else {
      console.error("PGN function not initialized yet.");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Interactive Chess Game</h1>
        <p>Play and explore chess moves in real-time</p>
      </header>

      {/* Evaluation display */}
      <Card shadow="sm" padding="lg" style={{ textAlign: "center", marginBottom: "20px" }}>
        <Title order={4}>Current Evaluation: {evaluation > 0 ? `+${evaluation}` : evaluation}</Title>
      </Card>

      {/* Responsive Chessboard */}
      <Chessboard
        onReset={(resetFn) => (resetRef.current = resetFn)}
        onFlip={(flipFn) => (flipRef.current = flipFn)}
        onToggleMode={(toggleModeFn) => (toggleModeRef.current = toggleModeFn)}
        onGetPgn={(getPgnFn) => (pgnRef.current = getPgnFn)}
        setEvaluation={setEvaluation} // Add setEvaluation to chessboard component
      />

      {/* Responsive button grid */}
      <Grid gutter="sm" justify="center">
        <Grid.Col span={6} xs={12} sm={4}>
          <Button fullWidth onClick={handleReset}>Reset Game</Button>
        </Grid.Col>
        <Grid.Col span={6} xs={12} sm={4}>
          <Button fullWidth onClick={handleFlip}>Flip Board</Button>
        </Grid.Col>
        <Grid.Col span={6} xs={12} sm={4}>
          <Button fullWidth onClick={handleToggleMode}>Toggle Mode</Button>
        </Grid.Col>
      </Grid>

      {/* Modal with iframe */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Chess Analysis"
        size="lg"
      >
        <iframe
          src={`https://lichess.org/analysis/pgn/${encodeURIComponent(pgn)}`}
          width="100%"
          height="400"
          title="Chess Analysis"
        />
      </Modal>
      <Button onClick={handleOpenModal} mt="md">
        Open Popup with Iframe
      </Button>

      {/* Horizontal Scrollable text area for game moves */}
      <ScrollArea style={{ width: "100%", whiteSpace: "nowrap" }} mt="lg">
        <Text className={styles.moves}>
          Move 1: e2-e4 | Move 2: e7-e5 | Move 3: Nf3 Nc6 | Move 4: Bb5 a6
          {/* Add more moves */}
        </Text>
      </ScrollArea>
    </div>
  );
};

export default Home;
