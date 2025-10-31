import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import DeckBuilderPage from "@/pages/deck-builder";
import DecksPage from "@/pages/DecksPage";
import LobbyPage from "@/pages/lobby";
import PlayFieldPage from "@/pages/playfield";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/deck-builder" component={DeckBuilderPage} />
      <Route path="/decks" component={DecksPage} />
      <Route path="/lobby/:id" component={LobbyPage} />
      <Route path="/playfield" component={PlayFieldPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
