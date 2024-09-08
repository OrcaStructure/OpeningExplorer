"use client";

import { useState, useRef } from "react";
import { Modal, Button, Grid, ScrollArea, Text } from "@mantine/core";
import Chessboard from "./components/chessboard.js";
import styles from "./page.module.css";

const Home = () => {
  const [modalOpened, setModalOpened] = useState(false);

  // Refs to hold the reset, flip, and toggle mode functions
  const resetRef = useRef(null);
  const flipRef = useRef(null);
  const toggleModeRef = useRef(null);

  // Function to handle resetting the game
  const handleReset = () => {
    if (resetRef.current) {
      resetRef.current(); // Calls the reset function on Chessboard
    }
  };

  // Function to handle flipping the board
  const handleFlip = () => {
    if (flipRef.current) {
      flipRef.current(); // Calls the flip function on Chessboard
    }
  };

  // Function to handle toggling the mode
  const handleToggleMode = () => {
    if (toggleModeRef.current) {
      toggleModeRef.current(); // Calls the toggle mode function on Chessboard
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Interactive Chess Game</h1>
        <p>Play and explore chess moves in real-time</p>
      </header>

      {/* Responsive Chessboard */}
      <Chessboard
        onReset={(resetFn) => (resetRef.current = resetFn)}
        onFlip={(flipFn) => (flipRef.current = flipFn)}
        onToggleMode={(toggleModeFn) => (toggleModeRef.current = toggleModeFn)}
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
        title="Embedded Game Info"
        size="lg"
      >
        <iframe
          src="https://example.com"
          width="100%"
          height="400"
          title="Iframe Example"
        />
      </Modal>
      <Button onClick={() => setModalOpened(true)} mt="md">
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
