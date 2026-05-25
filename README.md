# SteveBee

## Projektdaten

| Feld | Angabe |
| --- | --- |
| Projekt | Falling-Things |
| Spieltitel | SteveBee |
| Art | Browser-Spiel / Falling Objects Game |
| Modul | Web Technologies and Applications (WTA) |
| Autor | Niclas Verbrüggen |
| Version | v0.9.13 |
| Stand | 25.05.2026 |
| Lizenz | MIT License, Copyright (c) 2026 Niclas-FH |

## Kurzbeschreibung

SteveBee ist ein in HTML5 Canvas umgesetztes "Falling Objects Game". Ziel des Spiels ist es, den angreifenden (herunterfallenden) Bienen so lange wie möglich auszuweichen, um einen Highscore zu erzielen. 

### Story
Die Bienen greifen Steve an, da er ihren besonderen Bienennektar geklaut hat. Dieser Nektar verleiht ihm jedoch mächtige, spezielle Fähigkeiten, die er im Kampf ums Überleben einsetzen kann.

## Technik und Setup

- Plain Vanilla HTML5 Canvas-Anwendung
- Keine externen Frameworks
- Browserkompatibilität: Google Chrome, Microsoft Edge, Firefox
- **Start:** Das Projekt benötigt keine Installation. Die `index.html` kann direkt im Browser oder über einen lokalen Webserver (z. B. VS Code Live Server) gestartet werden.

## Spielmechanik und Ablauf

- **Wellen-System:** Das Spiel ist in mehrere Wellen unterteilt. Mit fortschreitender Dauer erhöht sich die Schwierigkeit.
- **Upgrade-Menü:** Nach jeder überstandenen Welle hat der Spieler die Möglichkeit, im Shop dauerhafte Verbesserungen für Steve zu erwerben.
- **Energieleiste:** Die Nutzung von Steves Spezialfähigkeiten verbraucht Energie und wird durch eine Energieleiste auf dem Spielfeld begrenzt.

### Die Einheiten & Hindernisse
* **Steve:** Die vom Spieler gesteuerte Hauptfigur.
* **Die Bienen:** Die bösartigen Gegner, die von oben herabfallen und Steve angreifen.
* **Nektar-Strahl:** Manchmal erscheint ein gelber Nektar-Strahl, welcher sich über die komplette Spielfeldbreite zieht und eine zusätzliche Gefahr darstellt.

## Fähigkeiten & Upgrades

### Spezialfähigkeiten (Kosten Energie)
* **Slow-Mo:** Verlangsamt kurzzeitig die Fallgeschwindigkeit aller herabstürzenden Bienen.
* **Teleport:** Lässt Steve blitzschnell in alle vier Himmelsrichtungen springen, um scheinbar unausweichlichen Situationen zu entkommen.
* **TNT:** Platziert ein TNT-Fass, welches nach einer 3-sekündigen Zündzeit explodiert und alle aktiven Gegner auf dem Spielfeld zerstört.

### Upgrades (Zwischen den Wellen)
* **Erhöhtes Tempo:** Steigert die normale Bewegungsgeschwindigkeit von Steve.
* **Verstärkte Slow-Mo:** Verlängert oder verstärkt den Verlangsamungseffekt.
* **Extra Leben:** Gewährt dem Spieler einen zusätzlichen Versuch, falls er von einer Biene getroffen wird.

## 3rd-Party-Komponenten und Medienlizenzen

Dieses Projekt verwendet Assets von Drittanbietern. *Minecraft* ist eine Marke von Mojang Synergies AB / Microsoft Corporation. Dieses Projekt steht in keiner Verbindung zu Mojang oder Microsoft. Das Projekt wird ausschließlich zu nicht-kommerziellen / privaten Zwecken im Rahmen des Moduls WTA verwendet.

| Bereich | Asset / Datei | Quelle / Rechteinhaber | Nutzungshinweis / Lizenz |
| --- | --- | --- | --- |
| **Projektcode** | `index.html`, `js/`, `css/` | Niclas Verbrüggen | MIT License |
| **Sounds** | Audio-Effekte | Minecraft / Mojang Studios / Microsoft | Rein private, nicht-kommerzielle Nutzung. |
| **Schriftart** | Pixelschriftart | Minecraft-Design / Mojang Studios | Rein private, nicht-kommerzielle Nutzung. |
| **Grafiken** | Steve-Kopf, Bienen, Logo | Eigenständig gezeichnet | Ursprüngliches Charakterdesign liegt bei Mojang Studios. |
| **Musik** | Hintergrundmusik | Undertale / Toby Fox LLC | Rein private, nicht-kommerzielle Nutzung. |

## Known Bugs

- **Musikgeschwindigkeit im Menü:** Wenn man während der aktiven Slow-Mo-Fähigkeit das Upgrade-Menü betritt, bleibt die Musikgeschwindigkeit dauerhaft verlangsamt.
- **UI-Versetzer (Firefox):** Der Volume-Slider ist in der Firefox-Browseransicht leicht versetzt.
- **Fragmente in der GUI:** Es kann unter bestimmten Bedingungen zu visuellen Fragmenten in der Energieleiste kommen.