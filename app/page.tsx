import { GameClient } from "./GameClient";

export default function Home() {
  return (
    <>
      <GameClient />
      <noscript>
        <div className="noscript-message">
          Для «Эха Камня» нужен JavaScript: мир, сохранения и управление работают прямо в браузере.
        </div>
      </noscript>
    </>
  );
}
