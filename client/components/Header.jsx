import logo from "/assets/openai-logomark.svg";

export default function Header() {
  return (
    <header className="w-full h-16 flex items-center bg-white">
      <div className="flex items-center gap-4 mx-4">
        <img style={{ width: "24px" }} src={logo} alt="OpenAI Logo" />
        <h1 className="font-sans">realtime console</h1>
      </div>
    </header>
  );
}