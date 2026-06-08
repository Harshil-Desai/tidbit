import React, { useState, useRef } from 'react';

/* ============================================================
   How AI & LLMs Work — From Token to Intelligence
   A fully self-contained interactive encyclopedia.
   All content + every SVG diagram is hardcoded below.
   ============================================================ */

const PART_META = {
  1: { name: 'The Basics', label: 'Part 1 · The Basics', color: '#2563eb', tint: '#eff6ff', soft: '#dbeafe' },
  2: { name: 'The Transformer', label: 'Part 2 · The Transformer', color: '#7c3aed', tint: '#f5f3ff', soft: '#ede9fe' },
  3: { name: 'Training an LLM', label: 'Part 3 · Training an LLM', color: '#16a34a', tint: '#f0fdf4', soft: '#dcfce7' },
  4: { name: 'Inference', label: 'Part 4 · Inference', color: '#0d9488', tint: '#f0fdfa', soft: '#ccfbf1' },
  5: { name: 'Advanced Concepts', label: 'Part 5 · Advanced Concepts', color: '#ea580c', tint: '#fff7ed', soft: '#ffedd5' },
};

const SVG_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const CHAPTERS = [
  /* ================= PART 1 ================= */
  {
    id: 1,
    part: 1,
    title: 'The Neuron',
    summary: `You'll understand exactly what one artificial neuron computes — how it turns several numbers into a single decision.`,
    explanation: `An artificial neuron is the smallest building block of a neural network, and all it really does is weigh up its inputs and produce one number. Each incoming value is multiplied by a weight that says how much that input matters, and all those products are added together along with an extra adjustable number called a bias. That single sum is then passed through an activation function, which decides how strongly the neuron should "fire." The result is one output value that gets handed to the next neurons in the network. By changing the weights, the very same neuron can learn to pay attention to some inputs and ignore others.`,
    analogy: `Think of a light dimmer wired to several switches. Each switch contributes a little or a lot to the final brightness depending on how its knob is turned (the weights), the room's baseline glow is the bias, and the dimmer blends everything into one brightness level (the output).`,
    concepts: [
      `A neuron multiplies each input by a weight, adds them up, then adds a bias.`,
      `Weights encode how important each input is — learning means tuning these numbers.`,
      `The activation function turns the raw sum into the neuron's final output.`,
      `One neuron is trivial; intelligence emerges when millions are connected.`,
    ],
    funFact: `The artificial neuron was described on paper in 1943 by McCulloch and Pitts — decades before any computer could run more than a handful of them at once.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar1" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="26" fontSize="12" fill="#64748b">A single artificial neuron: weigh, sum, activate, output</text>

        <circle cx="68" cy="80" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
        <text x="68" y="85" fontSize="13" textAnchor="middle" fill="#1e40af">x1</text>
        <circle cx="68" cy="150" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
        <text x="68" y="155" fontSize="13" textAnchor="middle" fill="#1e40af">x2</text>
        <circle cx="68" cy="220" r="22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
        <text x="68" y="225" fontSize="13" textAnchor="middle" fill="#1e40af">x3</text>
        <text x="68" y="270" fontSize="11" textAnchor="middle" fill="#1e40af">inputs</text>

        <line x1="90" y1="80" x2="286" y2="142" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar1)" />
        <line x1="90" y1="150" x2="288" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar1)" />
        <line x1="90" y1="220" x2="286" y2="158" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar1)" />
        <text x="180" y="100" fontSize="12" fill="#475569">× w1</text>
        <text x="180" y="144" fontSize="12" fill="#475569">× w2</text>
        <text x="180" y="198" fontSize="12" fill="#475569">× w3</text>

        <rect x="246" y="234" width="46" height="24" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="269" y="250" fontSize="11" textAnchor="middle" fill="#475569">+ bias</text>
        <line x1="292" y1="240" x2="312" y2="176" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ar1)" />

        <circle cx="320" cy="150" r="30" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="320" y="158" fontSize="22" textAnchor="middle" fill="#6d28d9">Σ</text>
        <text x="320" y="202" fontSize="11" textAnchor="middle" fill="#6d28d9">weighted sum</text>

        <line x1="350" y1="150" x2="420" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar1)" />

        <rect x="424" y="118" width="96" height="64" rx="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="472" y="146" fontSize="13" textAnchor="middle" fill="#6d28d9">activation</text>
        <text x="472" y="166" fontSize="13" textAnchor="middle" fill="#6d28d9">f ( )</text>

        <line x1="520" y1="150" x2="578" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar1)" />

        <circle cx="606" cy="150" r="22" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
        <text x="606" y="155" fontSize="14" textAnchor="middle" fill="#0f766e">y</text>
        <text x="606" y="195" fontSize="11" textAnchor="middle" fill="#0f766e">output</text>
      </svg>
    ),
  },

  {
    id: 2,
    part: 1,
    title: 'Layers & Deep Networks',
    summary: `You'll understand how stacking neurons into layers lets a network transform raw input into a useful answer.`,
    explanation: `A single neuron is limited, so we arrange many of them into layers and connect those layers end to end. The input layer simply holds the raw numbers you feed in, the hidden layers in the middle do the real transformation, and the output layer produces the final answer. Data flows in one direction: each layer takes the previous layer's outputs, applies its own weights, and passes new numbers forward. Stacking many hidden layers is exactly what the word "deep" in deep learning refers to. Each extra layer lets the network build more abstract features out of the simpler ones found by earlier layers.`,
    analogy: `Picture a factory assembly line. Raw parts enter at one end, each station reshapes or adds something, and a finished product rolls off the other end. No single station builds the whole thing — but together the line produces something complex.`,
    concepts: [
      `Networks are organized into input, hidden, and output layers.`,
      `Information flows forward — each layer's output becomes the next layer's input.`,
      `"Deep" just means there are many hidden layers stacked together.`,
      `Early layers detect simple patterns; later layers combine them into complex ones.`,
    ],
    funFact: `Depth beats width: a deep, narrow network can represent patterns that would require an astronomically wider shallow network to match.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>

        {[90, 150, 210].map((y1, i) => [70, 125, 180, 235].map((y2, j) => (
          <line key={'e1' + i + '_' + j} x1="108" y1={y1} x2="232" y2={y2} stroke="#e5e7eb" strokeWidth="1.3" />
        )))}
        {[70, 125, 180, 235].map((y1, i) => [70, 125, 180, 235].map((y2, j) => (
          <line key={'e2' + i + '_' + j} x1="268" y1={y1} x2="382" y2={y2} stroke="#e5e7eb" strokeWidth="1.3" />
        )))}
        {[70, 125, 180, 235].map((y1, i) => [125, 180].map((y2, j) => (
          <line key={'e3' + i + '_' + j} x1="418" y1={y1} x2="542" y2={y2} stroke="#e5e7eb" strokeWidth="1.3" />
        )))}

        {[90, 150, 210].map((y, i) => (
          <circle key={'i' + i} cx="90" cy={y} r="18" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
        ))}
        {[70, 125, 180, 235].map((y, i) => (
          <circle key={'h1' + i} cx="250" cy={y} r="18" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
        ))}
        {[70, 125, 180, 235].map((y, i) => (
          <circle key={'h2' + i} cx="400" cy={y} r="18" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
        ))}
        {[125, 180].map((y, i) => (
          <circle key={'o' + i} cx="560" cy={y} r="18" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
        ))}

        <line x1="90" y1="36" x2="556" y2="36" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#ar2)" />
        <text x="320" y="28" fontSize="12" textAnchor="middle" fill="#64748b">forward flow of data</text>

        <text x="90" y="278" fontSize="12" textAnchor="middle" fill="#1e40af">input</text>
        <text x="250" y="278" fontSize="12" textAnchor="middle" fill="#6d28d9">hidden 1</text>
        <text x="400" y="278" fontSize="12" textAnchor="middle" fill="#6d28d9">hidden 2</text>
        <text x="560" y="278" fontSize="12" textAnchor="middle" fill="#0f766e">output</text>
      </svg>
    ),
  },

  {
    id: 3,
    part: 1,
    title: 'Activation Functions',
    summary: `You'll understand why networks need non-linear activations and what ReLU, Sigmoid, and Tanh each do.`,
    explanation: `If every neuron only scaled and added its inputs, stacking layers would be pointless — a chain of straight-line operations is still just one straight line. Activation functions inject non-linearity, bending the signal so the network can model curves, corners, and complex relationships. ReLU is the workhorse: it passes positive numbers straight through and flattens anything negative to zero, which is fast and trains well. Sigmoid squashes any number into the range 0 to 1, handy for probabilities, while Tanh squashes into −1 to 1 and stays centered on zero. The activation you pick shapes how easily and how well a network learns.`,
    analogy: `An activation function is a gate with a personality. ReLU is a one-way valve that blocks anything below zero; Sigmoid is a soft dimmer easing between off and on; Tanh is a balance scale that tips smoothly between negative and positive.`,
    concepts: [
      `Without non-linearity, a deep network collapses into a single linear function.`,
      `ReLU outputs zero for negatives and the input itself for positives.`,
      `Sigmoid maps values into 0 to 1; Tanh maps them into −1 to 1.`,
      `The activation choice strongly affects training speed and stability.`,
    ],
    funFact: `ReLU's whole definition is "max(0, x)" — yet swapping it in for older smooth functions was a key trick that finally made very deep networks practical to train.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="24" fontSize="12" fill="#64748b">Three activation curves — each bends the signal differently</text>

        {/* ReLU */}
        <line x1="110" y1="70" x2="110" y2="215" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="40" y1="200" x2="185" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
        <polyline points="45,200 110,200 182,90" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
        <text x="112" y="244" fontSize="13" textAnchor="middle" fill="#6d28d9">ReLU</text>
        <text x="112" y="262" fontSize="11" textAnchor="middle" fill="#94a3b8">max(0, x)</text>

        {/* Sigmoid */}
        <line x1="320" y1="70" x2="320" y2="215" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="250" y1="200" x2="395" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
        <polyline points="252,197 285,192 305,178 320,140 335,102 360,88 392,83" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
        <text x="322" y="244" fontSize="13" textAnchor="middle" fill="#6d28d9">Sigmoid</text>
        <text x="322" y="262" fontSize="11" textAnchor="middle" fill="#94a3b8">squashes to 0…1</text>

        {/* Tanh */}
        <line x1="530" y1="70" x2="530" y2="215" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="460" y1="143" x2="605" y2="143" stroke="#cbd5e1" strokeWidth="1.5" />
        <polyline points="462,200 492,192 515,170 530,143 545,116 568,94 603,86" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
        <text x="532" y="244" fontSize="13" textAnchor="middle" fill="#6d28d9">Tanh</text>
        <text x="532" y="262" fontSize="11" textAnchor="middle" fill="#94a3b8">squashes to −1…1</text>
      </svg>
    ),
  },

  {
    id: 4,
    part: 1,
    title: 'Training & Backpropagation',
    summary: `You'll understand how a network learns from mistakes by measuring error and nudging every weight in the right direction.`,
    explanation: `A fresh network starts with random weights and makes terrible predictions, so it needs a way to improve. First it does a forward pass to produce an output, and we compare that output to the correct answer using a loss function that scores how wrong it was. Backpropagation then works backwards through the layers, using calculus to figure out how much each individual weight contributed to that error. Gradient descent uses those gradients to nudge every weight a small step in the direction that lowers the loss. Repeat this millions of times and the weights settle into values that make good predictions.`,
    analogy: `Imagine standing on a foggy hillside, trying to reach the lowest valley. You can't see far, but you can feel which way the ground slopes and take a small step downhill. The loss is your altitude, the slope is the gradient, and your step size is the learning rate.`,
    concepts: [
      `Loss measures how far the network's output is from the correct answer.`,
      `Backpropagation computes how much each weight contributed to the loss.`,
      `Gradient descent updates every weight in the direction that lowers loss.`,
      `The learning rate sets step size — too big overshoots, too small crawls.`,
    ],
    funFact: `Backpropagation was popularized in 1986, but the core idea sat largely idle for years — the world simply lacked the data and compute to reveal its power.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar4" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#ef4444" />
          </marker>
        </defs>
        <text x="20" y="24" fontSize="12" fill="#64748b">Gradient descent: a ball rolling down the loss surface</text>

        <line x1="70" y1="60" x2="70" y2="250" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="70" y1="250" x2="600" y2="250" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="40" y="150" fontSize="11" fill="#b91c1c" transform="rotate(-90 40 150)">loss (error)</text>
        <text x="335" y="278" fontSize="11" textAnchor="middle" fill="#64748b">value of a weight</text>

        {/* loss bowl */}
        <path d="M90 90 Q335 400 580 90" fill="none" stroke="#f87171" strokeWidth="3" />

        {/* descent steps */}
        <circle cx="150" cy="150" r="11" fill="#fca5a5" stroke="#ef4444" strokeWidth="2" />
        <text x="150" y="132" fontSize="11" textAnchor="middle" fill="#b91c1c">start</text>
        <line x1="160" y1="158" x2="210" y2="198" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar4)" />
        <line x1="222" y1="206" x2="270" y2="228" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar4)" />
        <line x1="282" y1="232" x2="322" y2="240" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar4)" />
        <text x="250" y="190" fontSize="11" fill="#475569">each step = learning rate</text>

        {/* minimum */}
        <circle cx="335" cy="243" r="8" fill="#2dd4bf" stroke="#0d9488" strokeWidth="2" />
        <text x="395" y="246" fontSize="11" fill="#0f766e">minimum loss</text>

        {/* forward / backward legend */}
        <rect x="430" y="120" width="170" height="60" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <line x1="444" y1="140" x2="470" y2="140" stroke="#3b82f6" strokeWidth="3" />
        <text x="478" y="144" fontSize="11" fill="#1e40af">forward → prediction</text>
        <line x1="444" y1="164" x2="470" y2="164" stroke="#ef4444" strokeWidth="3" strokeDasharray="5 4" />
        <text x="478" y="168" fontSize="11" fill="#b91c1c">backward → gradients</text>
      </svg>
    ),
  },

  {
    id: 5,
    part: 1,
    title: 'Overfitting & Generalization',
    summary: `You'll understand the difference between a model that truly learns and one that just memorizes its training data.`,
    explanation: `The real goal of training is generalization — performing well on new data the model has never seen, not just the examples it studied. Overfitting happens when a model memorizes the quirks and noise of its training set, scoring almost perfectly there while failing on fresh inputs. You can spot it by watching two curves: training loss keeps dropping, but validation loss bottoms out and then starts climbing back up. Techniques like dropout (randomly switching off neurons during training) and regularization (penalizing oversized weights) discourage this memorization. The sweet spot is the moment just before validation loss turns upward.`,
    analogy: `It's like a student who memorizes the exact answers to last year's exam. They ace the practice paper but freeze on this year's new questions — they learned the answers, not the subject.`,
    concepts: [
      `Generalization is performance on unseen data, not on the training set.`,
      `Overfitting shows as falling training loss but rising validation loss.`,
      `Dropout randomly disables neurons so no single path is over-relied upon.`,
      `Regularization penalizes complexity to stop the model memorizing noise.`,
    ],
    funFact: `Dropout was partly inspired by fraud prevention — shuffling which neurons are active is like rotating bank tellers so no fixed group can quietly collude on a shortcut.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="24" fontSize="12" fill="#64748b">Training vs validation loss over time</text>

        {/* overfitting shaded region */}
        <rect x="320" y="44" width="280" height="196" fill="#fef2f2" />
        <line x1="320" y1="44" x2="320" y2="240" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="460" y="62" fontSize="11" textAnchor="middle" fill="#b91c1c">overfitting region</text>

        <line x1="70" y1="44" x2="70" y2="240" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="70" y1="240" x2="600" y2="240" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="40" y="150" fontSize="11" fill="#64748b" transform="rotate(-90 40 150)">loss</text>
        <text x="335" y="268" fontSize="11" textAnchor="middle" fill="#64748b">training time (epochs) →</text>

        {/* training loss - keeps dropping */}
        <polyline points="80,80 140,118 210,150 290,175 380,193 470,205 590,214" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        {/* validation loss - dips then rises */}
        <polyline points="80,92 150,148 230,185 300,200 380,184 460,162 540,138 590,122" fill="none" stroke="#ef4444" strokeWidth="2.5" />

        <circle cx="300" cy="200" r="6" fill="#2dd4bf" stroke="#0d9488" strokeWidth="2" />
        <text x="300" y="222" fontSize="11" textAnchor="middle" fill="#0f766e">sweet spot</text>

        <rect x="430" y="74" width="150" height="44" rx="8" fill="#ffffff" stroke="#e2e8f0" />
        <line x1="444" y1="90" x2="468" y2="90" stroke="#3b82f6" strokeWidth="3" />
        <text x="476" y="94" fontSize="11" fill="#1e40af">training loss</text>
        <line x1="444" y1="108" x2="468" y2="108" stroke="#ef4444" strokeWidth="3" />
        <text x="476" y="112" fontSize="11" fill="#b91c1c">validation loss</text>
      </svg>
    ),
  },

  /* ================= PART 2 ================= */
  {
    id: 6,
    part: 2,
    title: 'Tokenization',
    summary: `You'll understand how raw text is chopped into tokens and converted into the numbers a model can read.`,
    explanation: `A language model can't read letters or words — it only works with numbers, so the very first step is always tokenization. A tokenizer splits text into chunks called tokens, which are often whole words but can also be word-pieces like "un" plus "happy." Each unique token is mapped to an integer ID using a fixed dictionary called the vocabulary. Modern models build that vocabulary with Byte Pair Encoding (BPE), which starts from single characters and repeatedly merges the most common neighboring pairs into larger pieces. This keeps the vocabulary compact while still being able to spell out any rare or invented word from smaller parts.`,
    analogy: `Tokens are LEGO bricks for language. Common words get their own big brick, while rare words are assembled from smaller character bricks — so you can build anything without needing a unique brick for every possible word.`,
    concepts: [
      `Tokenization splits raw text into tokens, then maps each token to an integer ID.`,
      `Tokens can be whole words, word-pieces, or single characters.`,
      `Byte Pair Encoding builds the vocabulary by merging frequent character pairs.`,
      `Vocabulary size (often 30k to 100k+) trades coverage against memory.`,
    ],
    funFact: `To an LLM a leading space usually belongs to the word that follows it — so " cat" and "cat" are often two different tokens, which is why spacing quietly changes results.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar6" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="22" fontSize="12" fill="#64748b">From a sentence to tokens to integer IDs</text>

        <rect x="170" y="34" width="300" height="30" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="320" y="54" fontSize="13" textAnchor="middle" fill="#1e40af">The cat sat on the mat</text>
        <line x1="320" y1="64" x2="320" y2="90" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar6)" />

        <text x="36" y="116" fontSize="11" fill="#6d28d9">tokens</text>
        <text x="36" y="150" fontSize="11" fill="#0f766e">IDs</text>
        {[
          { t: 'The', id: '464', x: 78, w: 46 },
          { t: '▁cat', id: '2543', x: 130, w: 58 },
          { t: '▁sat', id: '8030', x: 194, w: 58 },
          { t: '▁on', id: '319', x: 258, w: 48 },
          { t: '▁the', id: '262', x: 312, w: 54 },
          { t: '▁mat', id: '2603', x: 372, w: 58 },
        ].map((d, i) => (
          <g key={'tk' + i}>
            <rect x={d.x} y="98" width={d.w} height="28" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x={d.x + d.w / 2} y="116" fontSize="12" textAnchor="middle" fill="#6d28d9">{d.t}</text>
            <text x={d.x + d.w / 2} y="150" fontSize="12" textAnchor="middle" fill="#0f766e">{d.id}</text>
          </g>
        ))}

        <rect x="60" y="176" width="520" height="100" rx="8" fill="#faf5ff" stroke="#e9d5ff" strokeWidth="1.5" />
        <text x="320" y="196" fontSize="12" textAnchor="middle" fill="#7c3aed">BPE: merge the most frequent neighboring pairs, step by step</text>

        <rect x="120" y="214" width="30" height="24" rx="5" fill="#fff" stroke="#cbd5e1" />
        <text x="135" y="231" fontSize="12" textAnchor="middle" fill="#475569">e</text>
        <text x="158" y="231" fontSize="13" fill="#94a3b8">+</text>
        <rect x="170" y="214" width="30" height="24" rx="5" fill="#fff" stroke="#cbd5e1" />
        <text x="185" y="231" fontSize="12" textAnchor="middle" fill="#475569">s</text>
        <line x1="206" y1="226" x2="236" y2="226" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar6)" />
        <rect x="240" y="214" width="36" height="24" rx="5" fill="#ede9fe" stroke="#8b5cf6" />
        <text x="258" y="231" fontSize="12" textAnchor="middle" fill="#6d28d9">es</text>

        <rect x="120" y="244" width="36" height="24" rx="5" fill="#ede9fe" stroke="#8b5cf6" />
        <text x="138" y="261" fontSize="12" textAnchor="middle" fill="#6d28d9">es</text>
        <text x="162" y="261" fontSize="13" fill="#94a3b8">+</text>
        <rect x="176" y="244" width="30" height="24" rx="5" fill="#fff" stroke="#cbd5e1" />
        <text x="191" y="261" fontSize="12" textAnchor="middle" fill="#475569">t</text>
        <line x1="212" y1="256" x2="242" y2="256" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar6)" />
        <rect x="246" y="244" width="42" height="24" rx="5" fill="#ede9fe" stroke="#8b5cf6" />
        <text x="267" y="261" fontSize="12" textAnchor="middle" fill="#6d28d9">est</text>

        <text x="470" y="238" fontSize="12" textAnchor="middle" fill="#7c3aed">vocabulary</text>
        <text x="470" y="256" fontSize="12" textAnchor="middle" fill="#7c3aed">≈ 50,000 tokens</text>
      </svg>
    ),
  },

  {
    id: 7,
    part: 2,
    title: 'Embeddings',
    summary: `You'll understand how token IDs become rich vectors, and why words with similar meanings end up close together.`,
    explanation: `A token ID like 2543 is just a label — it carries no meaning on its own, so the model converts each ID into a long list of numbers called an embedding vector. These vectors live in a high-dimensional space (hundreds or thousands of dimensions) where direction and distance encode meaning. During training the model learns to place words with similar meaning near each other, so "cat" and "kitten" sit close while "cat" and "bicycle" sit far apart. Because order also matters, a positional encoding is added to each embedding to stamp in where the token sits in the sequence. The result is a vector that captures both what a token means and where it appears.`,
    analogy: `Picture a giant map of meaning. Every word is a pin, and the model arranges the pins so related ideas cluster into neighborhoods — animals here, fruit there — even though no one labeled the regions in advance.`,
    concepts: [
      `An embedding turns a token ID into a dense vector of learned numbers.`,
      `Distance and direction in this space encode meaning and relationships.`,
      `Similar words cluster together; unrelated words sit far apart.`,
      `Positional encoding adds order so the model knows where each token is.`,
    ],
    funFact: `Embedding math can be uncannily geometric: the vector for "king" minus "man" plus "woman" lands remarkably close to the vector for "queen."`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="22" fontSize="12" fill="#64748b">A 2D glimpse of meaning-space: related words cluster</text>

        <rect x="40" y="40" width="380" height="240" rx="8" fill="#f8fafc" stroke="#e2e8f0" />

        {/* animals cluster (blue) */}
        <ellipse cx="135" cy="100" rx="62" ry="46" fill="#dbeafe" fillOpacity="0.5" stroke="#3b82f6" strokeDasharray="4 4" />
        <circle cx="118" cy="86" r="5" fill="#2563eb" /><text x="118" y="78" fontSize="10" textAnchor="middle" fill="#1e40af">dog</text>
        <circle cx="150" cy="100" r="5" fill="#2563eb" /><text x="150" y="118" fontSize="10" textAnchor="middle" fill="#1e40af">cat</text>
        <circle cx="120" cy="116" r="5" fill="#2563eb" /><text x="120" y="134" fontSize="10" textAnchor="middle" fill="#1e40af">kitten</text>

        {/* royalty cluster (purple) */}
        <ellipse cx="330" cy="105" rx="58" ry="42" fill="#ede9fe" fillOpacity="0.5" stroke="#8b5cf6" strokeDasharray="4 4" />
        <circle cx="312" cy="96" r="5" fill="#7c3aed" /><text x="312" y="88" fontSize="10" textAnchor="middle" fill="#6d28d9">king</text>
        <circle cx="350" cy="112" r="5" fill="#7c3aed" /><text x="350" y="130" fontSize="10" textAnchor="middle" fill="#6d28d9">queen</text>

        {/* fruit cluster (teal) */}
        <ellipse cx="150" cy="220" rx="64" ry="42" fill="#ccfbf1" fillOpacity="0.5" stroke="#14b8a6" strokeDasharray="4 4" />
        <circle cx="128" cy="212" r="5" fill="#0d9488" /><text x="128" y="204" fontSize="10" textAnchor="middle" fill="#0f766e">apple</text>
        <circle cx="168" cy="228" r="5" fill="#0d9488" /><text x="168" y="246" fontSize="10" textAnchor="middle" fill="#0f766e">pear</text>

        <text x="135" y="160" fontSize="10" textAnchor="middle" fill="#64748b">animals</text>
        <text x="330" y="160" fontSize="10" textAnchor="middle" fill="#64748b">royalty</text>
        <text x="150" y="270" fontSize="10" textAnchor="middle" fill="#64748b">fruit</text>

        {/* positional encoding panel */}
        <rect x="446" y="40" width="170" height="240" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="531" y="62" fontSize="11" textAnchor="middle" fill="#7c3aed">+ positional</text>
        <text x="531" y="78" fontSize="11" textAnchor="middle" fill="#7c3aed">encoding</text>
        <path d="M460 150 Q480 110 500 150 T540 150 T580 150 T600 150" fill="none" stroke="#8b5cf6" strokeWidth="2" />
        <path d="M460 190 Q470 160 480 190 T500 190 T520 190 T540 190 T560 190 T580 190 T600 190" fill="none" stroke="#c4b5fd" strokeWidth="2" />
        <text x="531" y="236" fontSize="10" textAnchor="middle" fill="#7c3aed">waves stamp in</text>
        <text x="531" y="250" fontSize="10" textAnchor="middle" fill="#7c3aed">each token's position</text>
      </svg>
    ),
  },

  {
    id: 8,
    part: 2,
    title: 'The Attention Mechanism',
    summary: `You'll understand the core mechanism of transformers: how each token decides which other tokens to focus on.`,
    explanation: `Attention is the breakthrough that lets a model weigh the relevance of every word to every other word. For each token the model creates three vectors: a Query (what am I looking for), a Key (what do I offer), and a Value (the information I carry). It compares every Query against every Key to produce attention scores, which are high when two tokens are relevant to each other. Those scores pass through softmax so they become positive weights that add up to one, and each token's new representation becomes a weighted blend of all the Values. This is how the word "it" can reach back across a sentence and pull meaning from the noun it refers to.`,
    analogy: `Imagine a library. Your Query is the topic you're researching, each book's Key is the title on its spine, and the Value is what's actually inside. You skim the titles, decide which books matter most, and blend their contents in proportion to how relevant each one is.`,
    concepts: [
      `Each token produces a Query, a Key, and a Value vector.`,
      `Comparing Queries to Keys gives an attention score for every token pair.`,
      `Softmax turns the scores into weights that sum to one.`,
      `Each token's output is a weighted blend of all the Value vectors.`,
      `This lets any token draw information directly from any other token.`,
    ],
    funFact: `The 2017 paper that introduced this design was literally titled "Attention Is All You Need" — and for modern language models, it largely was.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar8" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="22" fontSize="12" fill="#64748b">Attention scores: how much each token attends to every other</text>

        <rect x="34" y="92" width="54" height="28" rx="6" fill="#fef3c7" stroke="#f59e0b" />
        <text x="61" y="110" fontSize="12" textAnchor="middle" fill="#b45309">Q</text>
        <rect x="34" y="132" width="54" height="28" rx="6" fill="#fde68a" stroke="#f59e0b" />
        <text x="61" y="150" fontSize="12" textAnchor="middle" fill="#b45309">K</text>
        <rect x="34" y="196" width="54" height="28" rx="6" fill="#ccfbf1" stroke="#14b8a6" />
        <text x="61" y="214" fontSize="12" textAnchor="middle" fill="#0f766e">V</text>

        <line x1="88" y1="106" x2="300" y2="120" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar8)" />
        <line x1="88" y1="146" x2="300" y2="140" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar8)" />
        <text x="150" y="98" fontSize="11" fill="#475569">score = Q · K</text>

        {/* heatmap grid 4x4 */}
        {(() => {
          const toks = ['The', 'cat', 'sat', 'mat'];
          const M = [
            [0.7, 0.1, 0.1, 0.1],
            [0.2, 0.6, 0.1, 0.1],
            [0.1, 0.2, 0.5, 0.2],
            [0.1, 0.1, 0.2, 0.6],
          ];
          const gx = 320, gy = 92, c = 32;
          const cells = [];
          toks.forEach((t, ci) => cells.push(
            <text key={'cl' + ci} x={gx + ci * c + c / 2} y={gy - 6} fontSize="10" textAnchor="middle" fill="#475569">{t}</text>
          ));
          toks.forEach((t, ri) => cells.push(
            <text key={'rl' + ri} x={gx - 6} y={gy + ri * c + c / 2 + 4} fontSize="10" textAnchor="end" fill="#475569">{t}</text>
          ));
          M.forEach((row, ri) => row.forEach((v, ci) => cells.push(
            <rect key={'cell' + ri + '_' + ci} x={gx + ci * c} y={gy + ri * c} width={c - 2} height={c - 2}
              fill="#f59e0b" fillOpacity={v} stroke="#fff" strokeWidth="1.5" />
          )));
          return cells;
        })()}

        <text x="384" y="244" fontSize="11" textAnchor="middle" fill="#b45309">softmax over each row</text>

        <line x1="450" y1="156" x2="500" y2="156" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar8)" />
        <line x1="88" y1="210" x2="498" y2="178" stroke="#14b8a6" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#ar8)" />
        <rect x="504" y="120" width="104" height="72" rx="10" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
        <text x="556" y="150" fontSize="11" textAnchor="middle" fill="#0f766e">weighted</text>
        <text x="556" y="166" fontSize="11" textAnchor="middle" fill="#0f766e">blend of V</text>
        <text x="556" y="206" fontSize="10" textAnchor="middle" fill="#0f766e">new representation</text>
      </svg>
    ),
  },

  {
    id: 9,
    part: 2,
    title: 'Multi-Head Attention',
    summary: `You'll understand why transformers run attention many times at once, each head spotting a different relationship.`,
    explanation: `One attention pattern can only capture one type of relationship at a time, which is limiting. So transformers run several attention operations in parallel, called heads, each with its own learned Query, Key, and Value projections. One head might track which adjective modifies which noun, another might follow long-range references, and another might focus on the word right next door. Their outputs are concatenated back together and passed through a final linear layer that mixes them into one combined representation. Multiple heads let the model view the same sentence through several lenses at once.`,
    analogy: `Think of a panel of specialists reading the same paragraph. A grammarian tracks sentence structure, a fact-checker links names to facts, and an editor watches tone — then they pool their notes into a single richer understanding.`,
    concepts: [
      `Each attention head has its own Query, Key, and Value projections.`,
      `Different heads learn to capture different relationship types.`,
      `Heads run in parallel on the same input, then their outputs are concatenated.`,
      `A final linear projection blends the heads into one representation.`,
    ],
    funFact: `Researchers can peek inside trained models and find heads with clear specialties — some reliably connect pronouns to the right noun, others track punctuation or syntax.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar9" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">Four heads, four different attention patterns over one sentence</text>

        {['The', 'tired', 'cat', 'slept', 'soundly'].map((t, i) => (
          <text key={'tok' + i} x={[70, 120, 170, 220, 270][i]} y="44" fontSize="10" textAnchor="middle" fill="#334155">{t}</text>
        ))}

        {[
          { label: 'Head 1', color: '#f59e0b', y: 80, a: 170, b: 220 },
          { label: 'Head 2', color: '#fb923c', y: 124, a: 120, b: 170 },
          { label: 'Head 3', color: '#fbbf24', y: 168, a: 220, b: 270 },
          { label: 'Head 4', color: '#d97706', y: 212, a: 70, b: 170 },
        ].map((h, i) => (
          <g key={'head' + i}>
            <text x="28" y={h.y + 4} fontSize="10" fill={h.color}>{h.label}</text>
            {[70, 120, 170, 220, 270].map((x, j) => (
              <circle key={'d' + i + '_' + j} cx={x} cy={h.y} r="4" fill="#94a3b8" />
            ))}
            <path d={'M' + h.a + ' ' + (h.y - 6) + ' Q' + ((h.a + h.b) / 2) + ' ' + (h.y - 30) + ' ' + h.b + ' ' + (h.y - 6)}
              fill="none" stroke={h.color} strokeWidth="2.2" />
          </g>
        ))}

        <path d="M300 78 L312 78 L312 212 L300 212" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="312" y1="145" x2="346" y2="145" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar9)" />
        <rect x="350" y="124" width="80" height="42" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="390" y="149" fontSize="12" textAnchor="middle" fill="#6d28d9">concat</text>
        <line x1="430" y1="145" x2="462" y2="145" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar9)" />
        <rect x="466" y="124" width="80" height="42" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="506" y="149" fontSize="12" textAnchor="middle" fill="#6d28d9">linear</text>
        <line x1="546" y1="145" x2="578" y2="145" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar9)" />
        <circle cx="604" cy="145" r="18" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
        <text x="604" y="149" fontSize="11" textAnchor="middle" fill="#0f766e">out</text>
      </svg>
    ),
  },

  {
    id: 10,
    part: 2,
    title: 'The Transformer Block',
    summary: `You'll understand the repeating building block of every LLM and how its pieces fit together.`,
    explanation: `The transformer is built by stacking one block over and over, and each block follows a fixed internal recipe. Input first passes through layer normalization, which keeps the numbers in a stable range, then through multi-head attention so tokens can share information. A residual connection adds the block's input back to its output, giving the signal a shortcut path. The data is normalized again and sent through a feed-forward network — two simple layers that process each token on its own and add reasoning capacity — followed by another residual add. Those residual shortcuts are crucial: they let gradients flow straight back through deep stacks, preventing the vanishing-gradient problem.`,
    analogy: `Picture an editing pipeline where every stage hands its work forward but also keeps a carbon copy of the original. If a stage makes things worse, the carbon copy (the residual) preserves what was already good, so progress is never lost.`,
    concepts: [
      `A block is: LayerNorm to attention to residual, then LayerNorm to feed-forward to residual.`,
      `The feed-forward network processes each token independently after attention mixes them.`,
      `Residual connections add the input back, creating a shortcut for the signal.`,
      `Those shortcuts let gradients flow through very deep networks without vanishing.`,
    ],
    funFact: `Inside the feed-forward network the model briefly expands each token to about four times its size and shrinks it back — most of a model's raw parameters live in that bulge.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar10" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
          <marker id="ar10p" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#8b5cf6" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">One transformer block (data flows top to bottom)</text>

        <rect x="200" y="28" width="200" height="22" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6" />
        <text x="300" y="43" fontSize="11" textAnchor="middle" fill="#1e40af">input token vectors</text>

        <rect x="200" y="62" width="200" height="22" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="300" y="77" fontSize="11" textAnchor="middle" fill="#475569">LayerNorm</text>

        <rect x="200" y="96" width="200" height="22" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="300" y="111" fontSize="11" textAnchor="middle" fill="#6d28d9">Multi-Head Attention</text>

        <circle cx="300" cy="138" r="11" fill="#fff" stroke="#8b5cf6" strokeWidth="2" />
        <text x="300" y="143" fontSize="13" textAnchor="middle" fill="#6d28d9">+</text>

        <rect x="200" y="160" width="200" height="22" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
        <text x="300" y="175" fontSize="11" textAnchor="middle" fill="#475569">LayerNorm</text>

        <rect x="200" y="194" width="200" height="22" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="300" y="209" fontSize="11" textAnchor="middle" fill="#6d28d9">Feed-Forward Network</text>

        <circle cx="300" cy="236" r="11" fill="#fff" stroke="#8b5cf6" strokeWidth="2" />
        <text x="300" y="241" fontSize="13" textAnchor="middle" fill="#6d28d9">+</text>

        <rect x="200" y="258" width="200" height="22" rx="6" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.6" />
        <text x="300" y="273" fontSize="11" textAnchor="middle" fill="#0f766e">output token vectors</text>

        <line x1="300" y1="50" x2="300" y2="60" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />
        <line x1="300" y1="84" x2="300" y2="94" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />
        <line x1="300" y1="118" x2="300" y2="125" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />
        <line x1="300" y1="149" x2="300" y2="158" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />
        <line x1="300" y1="182" x2="300" y2="192" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />
        <line x1="300" y1="216" x2="300" y2="223" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />
        <line x1="300" y1="247" x2="300" y2="256" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar10)" />

        <path d="M400 39 C 470 50, 470 120, 313 136" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#ar10p)" />
        <path d="M400 138 C 470 150, 470 222, 313 234" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#ar10p)" />
        <text x="486" y="92" fontSize="10" fill="#7c3aed" transform="rotate(90 486 92)">residual</text>
        <text x="486" y="192" fontSize="10" fill="#7c3aed" transform="rotate(90 486 192)">residual</text>
      </svg>
    ),
  },

  {
    id: 11,
    part: 2,
    title: 'Stacking Layers (The Full Model)',
    summary: `You'll understand how stacking dozens of identical blocks turns shallow pattern-matching into deep understanding.`,
    explanation: `A single transformer block is useful, but the real power comes from stacking many of them — modern models stack dozens to over a hundred. The token vectors travel up through the stack, and each layer refines the representation a little more, like repeatedly sharpening a blurry image. Researchers find a rough division of labor: early layers handle surface patterns and grammar, middle layers capture meaning and relationships, and later layers assemble higher-level, task-relevant reasoning. Every block has its own full set of weights, and because each contains large attention and feed-forward matrices, the totals quickly reach billions of parameters. Those billions of numbers are the model's entire learned knowledge.`,
    analogy: `It's like a photo passed down a line of retouchers. The first fixes exposure, the next sharpens edges, the next tunes color — each pass is small, but the cumulative effect turns a rough snapshot into a finished portrait.`,
    concepts: [
      `LLMs stack many identical transformer blocks, each with its own weights.`,
      `The representation is refined a little more at every layer.`,
      `Early layers learn syntax, middle layers meaning, late layers task reasoning.`,
      `Billions of parameters come from the many large matrices across all blocks.`,
    ],
    funFact: `The largest models hold hundreds of billions of parameters — more individual numbers than there are stars in the Milky Way.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar11" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">A stack of blocks — the representation sharpens on the way up</text>

        <rect x="250" y="269" width="150" height="18" rx="5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6" />
        <text x="325" y="282" fontSize="10" textAnchor="middle" fill="#1e40af">input embeddings</text>

        {[
          { y: 244, n: 'Block 1' }, { y: 210, n: 'Block 2' }, { y: 176, n: 'Block 3' },
          { y: 142, n: 'Block 4' }, { y: 108, n: 'Block 5' }, { y: 74, n: 'Block 6' },
        ].map((b, i) => (
          <g key={'blk' + i}>
            <rect x="250" y={b.y - 9} width="150" height="18" rx="5" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
            <text x="325" y={b.y + 4} fontSize="10" textAnchor="middle" fill="#6d28d9">{b.n}</text>
          </g>
        ))}

        <rect x="250" y="31" width="150" height="18" rx="5" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.6" />
        <text x="325" y="44" fontSize="10" textAnchor="middle" fill="#0f766e">final representation</text>

        {[267, 253, 219, 185, 151, 117, 83].map((y, i) => (
          <line key={'up' + i} x1="325" y1={y} x2="325" y2={y - 14} stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar11)" />
        ))}

        {/* annotation braces */}
        <line x1="233" y1="253" x2="233" y2="201" stroke="#3b82f6" strokeWidth="1.6" />
        <text x="222" y="231" fontSize="10" textAnchor="end" fill="#1e40af">syntax</text>
        <line x1="233" y1="185" x2="233" y2="133" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="222" y="163" fontSize="10" textAnchor="end" fill="#6d28d9">semantics</text>
        <line x1="233" y1="117" x2="233" y2="65" stroke="#0d9488" strokeWidth="1.6" />
        <text x="222" y="95" fontSize="10" textAnchor="end" fill="#0f766e">reasoning</text>

        <rect x="430" y="120" width="194" height="86" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="440" y="140" fontSize="10.5" fill="#7c3aed">Where billions of params live</text>
        <text x="440" y="158" fontSize="10" fill="#7c3aed">one block = big attention</text>
        <text x="440" y="174" fontSize="10" fill="#7c3aed">+ feed-forward matrices</text>
        <text x="440" y="194" fontSize="10" fill="#7c3aed">× many blocks = billions</text>
      </svg>
    ),
  },

  {
    id: 12,
    part: 2,
    title: 'The Language Modeling Objective',
    summary: `You'll understand the single task every LLM is trained to do — predict the next token — and how text emerges from it.`,
    explanation: `Underneath all the sophistication, a language model is trained to do one simple thing: predict the next token given everything before it. After the final transformer layer the model produces a score for every token in its vocabulary, and a softmax turns those scores into a probability distribution — how likely each possible next token is. During training it is rewarded for putting high probability on the token that actually came next. At generation time we sample from that distribution, and knobs like temperature, top-K, and top-P control how adventurous or conservative the choice is. Repeat the prediction one token at a time and coherent text emerges.`,
    analogy: `It's like an extremely well-read autocomplete. Given "The cat sat on the…", it doesn't know the answer — it estimates the odds for every word, leans toward "mat," "floor," or "sofa," then picks one and moves on.`,
    concepts: [
      `The model's only job is to predict the next token from the previous ones.`,
      `Its output is a probability distribution over the entire vocabulary.`,
      `Temperature flattens or sharpens that distribution to tune randomness.`,
      `Top-K and top-P restrict sampling to the most likely candidates.`,
    ],
    funFact: `This one objective — guess the next token — is enough to teach grammar, facts, translation, and even arithmetic, all as side effects of getting better at prediction.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar12" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="22" fontSize="12" fill="#64748b">Predicting the next token as a probability distribution</text>

        <rect x="20" y="44" width="206" height="28" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="123" y="63" fontSize="12" textAnchor="middle" fill="#1e40af">The cat sat on the __</text>
        <line x1="226" y1="58" x2="252" y2="58" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar12)" />
        <rect x="254" y="44" width="66" height="28" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="287" y="63" fontSize="12" textAnchor="middle" fill="#6d28d9">LLM</text>
        <line x1="287" y1="72" x2="287" y2="92" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar12)" />

        <text x="340" y="96" fontSize="11" fill="#475569">softmax → P(next token)</text>
        {[
          { t: 'mat', p: 0.61, w: 201, hl: true },
          { t: 'floor', p: 0.18, w: 59, hl: false },
          { t: 'sofa', p: 0.11, w: 36, hl: false },
          { t: 'roof', p: 0.06, w: 20, hl: false },
          { t: 'table', p: 0.04, w: 13, hl: false },
        ].map((d, i) => {
          const y = 112 + i * 32;
          return (
            <g key={'bar' + i}>
              <text x="394" y={y + 14} fontSize="11" textAnchor="end" fill="#334155">{d.t}</text>
              <rect x="402" y={y} width={d.w} height="20" rx="4"
                fill={d.hl ? '#14b8a6' : '#99f6e4'} stroke={d.hl ? '#0d9488' : '#5eead4'} strokeWidth="1.2" />
              <text x={402 + d.w + 8} y={y + 14} fontSize="10" fill="#0f766e">{d.p.toFixed(2)}</text>
            </g>
          );
        })}
        <text x="340" y="288" fontSize="10" fill="#94a3b8">highlighted bar = most likely next token (argmax)</text>
      </svg>
    ),
  },

  /* ================= PART 3 ================= */
  {
    id: 13,
    part: 3,
    title: 'Pre-training Data',
    summary: `You'll understand what an LLM reads during pre-training and how that raw text is cleaned into a usable corpus.`,
    explanation: `Before a model can predict text, it has to read an enormous amount of it — a pre-training corpus drawn from across the internet and beyond. Typical sources include filtered web pages, books, code repositories, encyclopedias, and academic text, blended in carefully chosen proportions. Raw web data is messy, so heavy cleaning is required: removing spam and boilerplate, filtering low-quality pages, and stripping out harmful content. Deduplication matters a great deal, because seeing the same passage many times teaches the model to memorize rather than generalize. The cleaned result is tokenized into hundreds of billions — sometimes trillions — of tokens.`,
    analogy: `Think of preparing a library for a voracious reader. You don't dump every scrap of paper on the shelves; you weed out duplicates, toss the junk mail, and curate a balanced collection so the reader learns broadly and well.`,
    concepts: [
      `Pre-training data blends web text, books, code, and reference material.`,
      `Cleaning removes spam, boilerplate, and harmful or low-quality content.`,
      `Deduplication stops the model from memorizing repeated passages.`,
      `Corpora are measured in hundreds of billions or trillions of tokens.`,
    ],
    funFact: `Data quality can matter more than raw quantity — a smaller, well-filtered corpus often beats a larger, noisier one trained at the same cost.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="22" fontSize="12" fill="#64748b">A typical pre-training data mix (illustrative proportions)</text>

        <path d="M190 155 L190 60 A95 95 0 0 1 219.4 245.3 Z" fill="#3b82f6" />
        <path d="M190 155 L219.4 245.3 A95 95 0 0 1 113.1 210.9 Z" fill="#8b5cf6" />
        <path d="M190 155 L113.1 210.9 A95 95 0 0 1 106.8 109.2 Z" fill="#14b8a6" />
        <path d="M190 155 L106.8 109.2 A95 95 0 0 1 149.5 69.0 Z" fill="#f59e0b" />
        <path d="M190 155 L149.5 69.0 A95 95 0 0 1 190 60 Z" fill="#94a3b8" />
        <circle cx="190" cy="155" r="95" fill="none" stroke="#fff" strokeWidth="2" />

        {[
          { c: '#3b82f6', t: 'Web pages', p: '45%', y: 80 },
          { c: '#8b5cf6', t: 'Code', p: '20%', y: 110 },
          { c: '#14b8a6', t: 'Books', p: '18%', y: 140 },
          { c: '#f59e0b', t: 'Reference / wiki', p: '10%', y: 170 },
          { c: '#94a3b8', t: 'Other', p: '7%', y: 200 },
        ].map((d, i) => (
          <g key={'lg' + i}>
            <rect x="360" y={d.y - 12} width="16" height="16" rx="3" fill={d.c} />
            <text x="384" y={d.y} fontSize="12" fill="#334155">{d.t}</text>
            <text x="600" y={d.y} fontSize="12" textAnchor="end" fill="#64748b">{d.p}</text>
          </g>
        ))}
        <text x="320" y="262" fontSize="11" textAnchor="middle" fill="#64748b">cleaned · deduplicated · tokenized → hundreds of billions of tokens</text>
      </svg>
    ),
  },

  {
    id: 14,
    part: 3,
    title: 'The Pre-training Loop',
    summary: `You'll understand the repeating loop that actually trains a model, and the optimizer that keeps each step stable.`,
    explanation: `Pre-training is a loop repeated for trillions of tokens, and every pass through it performs the same handful of steps. A batch of text is tokenized and fed through the model in a forward pass to predict the next token at every position. The predictions are scored against the real next tokens with cross-entropy loss, which is low when the model is confident and correct. Backpropagation computes gradients, and an optimizer called AdamW uses them to update the weights — adapting the step size per weight and gently shrinking weights to curb overfitting. A learning-rate schedule warms the rate up at the start and decays it later, so training is stable early and finely tuned near the end.`,
    analogy: `It's like practicing thousands of flashcards. You guess each card, check the answer, note how far off you were, and adjust — making bold corrections early and gentler tweaks as you near mastery.`,
    concepts: [
      `The loop is: batch to forward pass to loss to backward pass to optimizer step.`,
      `Cross-entropy loss rewards high probability on the correct next token.`,
      `AdamW adapts the step size per weight and adds weight decay.`,
      `Learning-rate warmup then decay keeps training stable and precise.`,
    ],
    funFact: `A single training run can execute this loop hundreds of thousands of times and run for weeks across thousands of GPUs without ever stopping.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar14" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">The training loop, repeated over and over</text>

        <path d="M512 78 C 512 30, 70 30, 70 78" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar14)" />
        <text x="290" y="26" fontSize="11" textAnchor="middle" fill="#64748b">loop · repeat for trillions of tokens</text>

        {[
          { x: 18, w: 94, c1: '#dbeafe', c2: '#3b82f6', t1: 'batch of', t2: 'text', tc: '#1e40af' },
          { x: 128, w: 94, c1: '#ede9fe', c2: '#8b5cf6', t1: 'forward', t2: 'pass', tc: '#6d28d9' },
          { x: 238, w: 94, c1: '#fee2e2', c2: '#ef4444', t1: 'cross-entropy', t2: 'loss', tc: '#b91c1c' },
          { x: 348, w: 100, c1: '#fee2e2', c2: '#ef4444', t1: 'backprop', t2: 'gradients', tc: '#b91c1c' },
          { x: 462, w: 96, c1: '#ede9fe', c2: '#8b5cf6', t1: 'AdamW', t2: 'step', tc: '#6d28d9' },
        ].map((n, i) => (
          <g key={'n' + i}>
            <rect x={n.x} y="76" width={n.w} height="42" rx="8" fill={n.c1} stroke={n.c2} strokeWidth="1.6" />
            <text x={n.x + n.w / 2} y="94" fontSize="11" textAnchor="middle" fill={n.tc}>{n.t1}</text>
            <text x={n.x + n.w / 2} y="109" fontSize="11" textAnchor="middle" fill={n.tc}>{n.t2}</text>
          </g>
        ))}
        {[112, 222, 332, 448].map((x, i) => (
          <line key={'fa' + i} x1={x} y1="97" x2={x + 16} y2="97" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar14)" />
        ))}

        <rect x="150" y="150" width="340" height="116" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="320" y="172" fontSize="11" textAnchor="middle" fill="#64748b">learning-rate schedule: warm up, then decay</text>
        <line x1="180" y1="240" x2="470" y2="240" stroke="#cbd5e1" strokeWidth="1.4" />
        <line x1="180" y1="190" x2="180" y2="240" stroke="#cbd5e1" strokeWidth="1.4" />
        <polyline points="182,238 210,200 240,196 300,210 380,224 462,234" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
        <text x="214" y="256" fontSize="9.5" textAnchor="middle" fill="#7c3aed">warmup</text>
        <text x="400" y="256" fontSize="9.5" textAnchor="middle" fill="#7c3aed">decay</text>
      </svg>
    ),
  },

  {
    id: 15,
    part: 3,
    title: 'Compute & Scale',
    summary: `You'll understand why training takes vast compute and how scaling laws balance data against model size.`,
    explanation: `Training a large model means doing an astronomical number of multiplications, far beyond any single chip, so the work is spread across clusters of GPUs. Two tricks divide the labor: data parallelism gives each GPU a different slice of the batch, while tensor parallelism splits one huge matrix across several GPUs. Scaling laws describe a reliable pattern — as you grow compute, model size, and data together, the loss falls smoothly and predictably. The Chinchilla finding showed many early models were undertrained: for a fixed compute budget you often want far more tokens relative to parameters. Get that balance right and a smaller, well-fed model can beat a larger, data-starved one.`,
    analogy: `Imagine baking on a fixed budget. You can buy a bigger oven (more parameters) or more ingredients (more data) — but spending everything on a giant oven and skimping on ingredients leaves it half empty. The best results balance the two.`,
    concepts: [
      `Training is split across GPU clusters using data and tensor parallelism.`,
      `Scaling laws show loss falling smoothly as compute, size, and data grow.`,
      `Chinchilla showed many models were undertrained — they needed more tokens.`,
      `For a fixed budget, balancing parameters and data beats maxing out either.`,
    ],
    funFact: `Training a frontier model can cost tens of millions of dollars in compute and use as much electricity as a small town does over the same stretch of time.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="22" fontSize="12" fill="#64748b">Scaling law: more compute drives loss down predictably</text>

        <line x1="60" y1="50" x2="60" y2="244" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="60" y1="244" x2="360" y2="244" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="34" y="150" fontSize="11" fill="#64748b" transform="rotate(-90 34 150)">loss</text>
        <text x="210" y="270" fontSize="11" textAnchor="middle" fill="#64748b">compute (log scale) →</text>

        <polyline points="74,72 120,108 180,134 260,150 350,156" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        <text x="356" y="150" fontSize="10" textAnchor="end" fill="#64748b">smaller model</text>
        <polyline points="74,96 120,138 180,172 260,196 350,214" fill="none" stroke="#14b8a6" strokeWidth="2.5" />
        <text x="356" y="208" fontSize="10" textAnchor="end" fill="#0f766e">larger model</text>

        <rect x="420" y="58" width="200" height="150" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="520" y="78" fontSize="11" textAnchor="middle" fill="#7c3aed">GPU cluster</text>
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
          <rect key={'g' + r + '_' + c} x={440 + c * 38} y={90 + r * 26} width="30" height="18" rx="3" fill="#8b5cf6" fillOpacity="0.85" />
        )))}
        <text x="520" y="226" fontSize="10" textAnchor="middle" fill="#64748b">thousands of GPUs working in parallel</text>
      </svg>
    ),
  },

  {
    id: 16,
    part: 3,
    title: 'Fine-tuning & Instruction Tuning',
    summary: `You'll understand how a raw next-token predictor is taught to follow instructions and act like a helpful assistant.`,
    explanation: `A freshly pre-trained model is a brilliant autocomplete but not yet an assistant — ask it a question and it might just continue with more questions. Fine-tuning adapts that base model toward a desired behavior by continuing training on a smaller, carefully chosen dataset. For instruction tuning, that dataset is made of prompt-and-response pairs: an instruction plus a high-quality example answer written or curated by humans. Training on many such pairs teaches the model to respond helpfully when asked, instead of merely predicting plausible web text. The mechanics are the same as pre-training — just far less data, focused on shaping behavior rather than absorbing knowledge.`,
    analogy: `The base model is a gifted graduate who has read everything but never held a job. Instruction tuning is the onboarding week: showing worked examples of exactly how to answer requests in this role, until helpful responses become second nature.`,
    concepts: [
      `A base model predicts text; an instruction-tuned model answers requests.`,
      `Supervised fine-tuning continues training on curated prompt-response pairs.`,
      `It uses far less data than pre-training but is targeted at behavior.`,
      `The training mechanics are identical — only the data and goal change.`,
    ],
    funFact: `A few thousand to a few hundred thousand well-written examples can dramatically reshape behavior — tiny next to pre-training, yet enough to turn a rambler into an assistant.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar16" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">Fine-tuning reshapes behavior using prompt → response pairs</text>

        <rect x="30" y="44" width="120" height="40" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="90" y="69" fontSize="12" textAnchor="middle" fill="#6d28d9">Base model</text>

        <line x1="150" y1="64" x2="486" y2="64" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar16)" />
        {[230, 292, 354].map((x, i) => (
          <g key={'sft' + i}>
            <rect x={x} y="50" width="54" height="28" rx="5" fill="#fff" stroke="#cbd5e1" strokeWidth="1.3" />
            <text x={x + 27} y="68" fontSize="11" textAnchor="middle" fill="#475569">Q → A</text>
          </g>
        ))}
        <text x="318" y="98" fontSize="10" textAnchor="middle" fill="#64748b">supervised fine-tuning</text>

        <rect x="490" y="44" width="120" height="40" rx="8" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.6" />
        <text x="550" y="63" fontSize="11" textAnchor="middle" fill="#0f766e">Instruction-</text>
        <text x="550" y="77" fontSize="11" textAnchor="middle" fill="#0f766e">tuned model</text>

        <line x1="90" y1="84" x2="90" y2="118" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar16)" />
        <rect x="20" y="120" width="190" height="92" rx="8" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.4" />
        <text x="34" y="142" fontSize="10.5" fill="#b91c1c">Prompt: capital of France?</text>
        <text x="34" y="164" fontSize="10.5" fill="#b91c1c">Base: ...and the capital of</text>
        <text x="34" y="180" fontSize="10.5" fill="#b91c1c">Spain? And what about...</text>
        <text x="34" y="202" fontSize="10" fill="#ef4444" fontStyle="italic">(just keeps predicting text)</text>

        <line x1="550" y1="84" x2="550" y2="118" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar16)" />
        <rect x="430" y="120" width="190" height="92" rx="8" fill="#f0fdfa" stroke="#14b8a6" strokeWidth="1.4" />
        <text x="444" y="142" fontSize="10.5" fill="#0f766e">Prompt: capital of France?</text>
        <text x="444" y="168" fontSize="12" fill="#0f766e">Assistant: Paris.</text>
        <text x="444" y="198" fontSize="10" fill="#14b8a6" fontStyle="italic">(answers the request)</text>
      </svg>
    ),
  },

  {
    id: 17,
    part: 3,
    title: 'RLHF — Reinforcement Learning from Human Feedback',
    summary: `You'll understand the three-step process that aligns a model with human preferences to make it more helpful and safe.`,
    explanation: `Instruction tuning teaches a model to answer, but not which of many possible answers people actually prefer — and that is where RLHF comes in. Step one collects human preference data: people see two responses to the same prompt and pick the better one. Step two trains a separate reward model on those comparisons so it can score any response the way humans tend to. Step three uses reinforcement learning (commonly PPO) to nudge the language model toward responses the reward model rates highly, while a guardrail keeps it from drifting too far from its tuned behavior. The result is a model that is noticeably more helpful, honest, and harmless.`,
    analogy: `Think of training a chef. First diners taste dish pairs and say which they prefer, then you hire a critic who learns those tastes, and finally the chef cooks repeatedly, using the critic's scores to refine recipes toward what diners love.`,
    concepts: [
      `Step 1: humans compare response pairs and pick the better one.`,
      `Step 2: a reward model learns to score responses like humans do.`,
      `Step 3: reinforcement learning optimizes the model against that reward.`,
      `A constraint keeps the model from drifting too far while it improves.`,
    ],
    funFact: `RLHF was the key ingredient that turned capable-but-unruly base models into the polished, instruction-following assistants that sparked the recent AI boom.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar17" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
          <marker id="ar17t" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#0d9488" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">RLHF in three steps</text>

        {/* step 1 */}
        <text x="110" y="42" fontSize="11" textAnchor="middle" fill="#b45309">Step 1 · collect preferences</text>
        <rect x="40" y="92" width="140" height="24" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="55" y="108" fontSize="11" fill="#b45309">response A</text>
        <text x="166" y="109" fontSize="13" fill="#16a34a">✓</text>
        <rect x="40" y="126" width="140" height="24" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.4" />
        <text x="55" y="142" fontSize="11" fill="#475569">response B</text>
        <text x="166" y="143" fontSize="12" fill="#94a3b8">✗</text>
        <text x="110" y="176" fontSize="10" textAnchor="middle" fill="#64748b">a human prefers A</text>

        <line x1="190" y1="120" x2="222" y2="120" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar17)" />

        {/* step 2 */}
        <text x="320" y="42" fontSize="11" textAnchor="middle" fill="#6d28d9">Step 2 · reward model</text>
        <rect x="248" y="92" width="144" height="48" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="320" y="120" fontSize="11" textAnchor="middle" fill="#6d28d9">Reward model</text>
        <line x1="320" y1="140" x2="320" y2="158" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar17)" />
        <text x="320" y="174" fontSize="11" textAnchor="middle" fill="#0f766e">score: 0.82</text>

        <line x1="394" y1="116" x2="426" y2="116" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar17)" />

        {/* step 3 */}
        <text x="528" y="42" fontSize="11" textAnchor="middle" fill="#0f766e">Step 3 · PPO optimize</text>
        <rect x="462" y="74" width="132" height="34" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="528" y="95" fontSize="11" textAnchor="middle" fill="#6d28d9">LLM (policy)</text>
        <line x1="528" y1="108" x2="528" y2="122" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar17)" />
        <rect x="470" y="124" width="116" height="26" rx="6" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4" />
        <text x="528" y="141" fontSize="10.5" textAnchor="middle" fill="#1e40af">response</text>
        <line x1="528" y1="150" x2="528" y2="164" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar17)" />
        <rect x="470" y="166" width="116" height="26" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="528" y="183" fontSize="10.5" textAnchor="middle" fill="#b45309">reward score</text>
        <path d="M470 179 C 430 179, 430 91, 460 91" fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar17t)" />
        <text x="416" y="136" fontSize="10" textAnchor="middle" fill="#0f766e" transform="rotate(-90 416 136)">update</text>
      </svg>
    ),
  },

  /* ================= PART 4 ================= */
  {
    id: 18,
    part: 4,
    title: 'The Inference Loop',
    summary: `You'll understand how a trained model actually writes text — one token at a time — and why the KV cache keeps it fast.`,
    explanation: `Once trained, a model generates text autoregressively, meaning it produces one token at a time and feeds each new token back in to predict the next. You start with a prompt, the model outputs a probability distribution, a token is sampled and appended to the sequence, and the whole thing repeats until a stop signal or length limit. Naively, every new token would require re-processing the entire sequence from scratch, which is wasteful. The KV cache fixes this by storing the Key and Value vectors already computed for previous tokens, so each step only processes the single new token. That cache is the main reason chat responses stream out smoothly instead of slowing to a crawl as they grow.`,
    analogy: `It's like writing a sentence word by word while keeping detailed notes in the margin. Instead of rereading the whole page before each new word, you glance at your running notes (the KV cache) and just add the next one.`,
    concepts: [
      `Generation is autoregressive: predict a token, append it, then repeat.`,
      `Each step samples one token from the model's probability distribution.`,
      `The KV cache stores past Keys and Values so they aren't recomputed.`,
      `Caching keeps generation fast even as the text grows longer.`,
    ],
    funFact: `Because each token depends on all the ones before it, an LLM literally cannot write the end of a sentence before the middle — it has no global draft, only the next word.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar18" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">Autoregressive generation: one token at a time</text>

        {[
          { t: 'The', x: 30 }, { t: 'cat', x: 80 }, { t: 'sat', x: 130 },
        ].map((d, i) => (
          <g key={'sq' + i}>
            <rect x={d.x} y="44" width="46" height="26" rx="5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4" />
            <text x={d.x + 23} y="61" fontSize="11" textAnchor="middle" fill="#1e40af">{d.t}</text>
          </g>
        ))}
        <rect x="182" y="44" width="56" height="26" rx="5" fill="#fff" stroke="#cbd5e1" strokeWidth="1.4" strokeDasharray="4 3" />
        <text x="210" y="61" fontSize="11" textAnchor="middle" fill="#94a3b8">next?</text>
        <text x="120" y="36" fontSize="10" fill="#64748b">sequence so far</text>

        <line x1="135" y1="72" x2="135" y2="108" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar18)" />
        <text x="146" y="92" fontSize="10" fill="#64748b">feed in</text>

        <rect x="60" y="110" width="150" height="44" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="135" y="137" fontSize="11" textAnchor="middle" fill="#6d28d9">Transformer model</text>

        <line x1="135" y1="156" x2="135" y2="174" stroke="#94a3b8" strokeWidth="2" markerStart="url(#ar18)" markerEnd="url(#ar18)" />
        <rect x="60" y="176" width="150" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="135" y="201" fontSize="10.5" textAnchor="middle" fill="#b45309">KV cache · past K, V</text>
        <text x="232" y="168" fontSize="9.5" fill="#64748b">store + reuse</text>

        <line x1="210" y1="132" x2="318" y2="132" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar18)" />
        <rect x="320" y="110" width="150" height="44" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="395" y="137" fontSize="11" textAnchor="middle" fill="#6d28d9">sample next token</text>

        <line x1="395" y1="108" x2="395" y2="74" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar18)" />
        <rect x="372" y="44" width="46" height="26" rx="5" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.6" />
        <text x="395" y="61" fontSize="11" textAnchor="middle" fill="#0f766e">on</text>

        <line x1="372" y1="57" x2="242" y2="57" stroke="#14b8a6" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar18)" />
        <text x="306" y="33" fontSize="10" textAnchor="middle" fill="#0f766e">append → repeat</text>

        <text x="520" y="132" fontSize="11" fill="#64748b">…the sequence</text>
        <text x="520" y="148" fontSize="11" fill="#64748b">grows by one</text>
        <text x="520" y="164" fontSize="11" fill="#64748b">token each loop</text>
      </svg>
    ),
  },

  {
    id: 19,
    part: 4,
    title: 'Decoding Strategies',
    summary: `You'll understand the different ways a model turns its probability distribution into an actual chosen word.`,
    explanation: `Every step the model hands us a probability for each possible next token, and the decoding strategy decides which one to actually pick. Greedy decoding always takes the single highest-probability token, which is safe but can be repetitive and dull. Sampling instead draws a token at random according to the probabilities, and temperature controls how bold that draw is: low temperature sharpens the distribution toward the top choice, high temperature flattens it so rarer words get a chance. Top-K keeps only the K most likely tokens before sampling, and Top-P (nucleus) keeps the smallest set whose probabilities add up to a threshold like 0.9. Beam search takes another tack, exploring several candidate sequences in parallel and keeping the most probable overall.`,
    analogy: `Picture ordering at a restaurant. Greedy always orders the single most popular dish; sampling rolls dice over the menu; temperature is how adventurous you feel; and Top-K or Top-P simply cross off the unpopular options before you choose.`,
    concepts: [
      `Greedy decoding always picks the highest-probability token.`,
      `Sampling draws a token at random in proportion to its probability.`,
      `Temperature sharpens (low) or flattens (high) the distribution.`,
      `Top-K and Top-P restrict the pool to the most likely candidates first.`,
    ],
    funFact: `Cranking temperature toward zero makes a model nearly deterministic; pushing it high enough turns coherent prose into surreal, dreamlike word salad.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="20" fontSize="12" fill="#64748b">Temperature reshapes the same next-token distribution</text>

        {[
          { x: 30, title: 'T = 0.5  (sharp)', h: [120, 22, 14, 9, 6] },
          { x: 230, title: 'T = 1.0  (balanced)', h: [80, 52, 36, 24, 16] },
          { x: 430, title: 'T = 1.5  (flat)', h: [54, 46, 40, 34, 28] },
        ].map((p, pi) => {
          const base = 232;
          const maxh = Math.max.apply(null, p.h);
          const els = [];
          els.push(<text key={'t' + pi} x={p.x + 90} y="44" fontSize="11" textAnchor="middle" fill="#475569">{p.title}</text>);
          els.push(<line key={'bl' + pi} x1={p.x + 4} y1={base} x2={p.x + 176} y2={base} stroke="#cbd5e1" strokeWidth="1.4" />);
          p.h.forEach((h, i) => {
            const bx = p.x + 12 + i * 32;
            const hl = h === maxh;
            els.push(
              <rect key={'b' + pi + '_' + i} x={bx} y={base - h} width="22" height={h} rx="3"
                fill={hl ? '#14b8a6' : '#f59e0b'} fillOpacity={hl ? 1 : 0.85} />
            );
          });
          return <g key={'panel' + pi}>{els}</g>;
        })}

        <line x1="430" y1="196" x2="606" y2="196" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="5 4" />
        <text x="518" y="190" fontSize="9.5" textAnchor="middle" fill="#b91c1c">Top-P / Top-K cutoff</text>

        <text x="320" y="262" fontSize="10.5" textAnchor="middle" fill="#64748b">teal bar = greedy pick · low T concentrates probability · high T spreads it out</text>
      </svg>
    ),
  },

  {
    id: 20,
    part: 4,
    title: 'Context Window',
    summary: `You'll understand what the context window is, why it's limited, and how models stretch it to handle long inputs.`,
    explanation: `The context window is the maximum number of tokens a model can attend to at once — its working span of text, including both your prompt and its reply. The limit exists because attention compares every token with every other token, so the cost grows with the square of the length: double the text and you roughly quadruple the work. That quadratic blow-up is why very long contexts are expensive in memory and time. To track position within the window, models add positional information; modern schemes like RoPE rotate each token's vector by an angle based on its position, while ALiBi gently penalizes attention to faraway tokens. These tricks let models extend to longer sequences far more gracefully than the original fixed position tables did.`,
    analogy: `Think of it as the model's desk. Only so many pages fit on the desk at once; anything pushed off the edge is forgotten — and the bigger the desk, the more it costs to keep every page in view of every other.`,
    concepts: [
      `The context window is the maximum tokens a model can consider at once.`,
      `Attention cost grows with the square of the sequence length (O(n²)).`,
      `Positional encoding tells the model where each token sits.`,
      `RoPE rotates vectors by position; ALiBi penalizes distant attention.`,
    ],
    funFact: `Going from a 4,000-token to a 128,000-token window is not 32× more attention work but closer to 1,000× — which is why long context was such a hard engineering problem.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="20" fontSize="12" fill="#64748b">A fixed window slides over the token stream</text>

        {Array.from({ length: 14 }).map((_, i) => {
          const x = 40 + i * 34;
          const inWin = i >= 5 && i <= 11;
          return (
            <rect key={'tok' + i} x={x} y="50" width="30" height="30" rx="4"
              fill={inWin ? '#dbeafe' : '#e2e8f0'} stroke={inWin ? '#3b82f6' : '#cbd5e1'} strokeWidth="1.4" />
          );
        })}
        <rect x="206" y="44" width="242" height="42" rx="6" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 4" />
        <text x="327" y="36" fontSize="10.5" textAnchor="middle" fill="#1e40af">context window (fixed size)</text>
        <text x="120" y="100" fontSize="9.5" textAnchor="middle" fill="#94a3b8">older tokens fall off</text>

        <text x="40" y="138" fontSize="11" fill="#b45309">attention: every token vs every earlier one — area grows as n²</text>
        {(() => {
          const cells = [];
          const ox = 50, oy = 150, c = 16, n = 6;
          for (let r = 0; r < n; r++) {
            for (let col = 0; col <= r; col++) {
              cells.push(
                <rect key={'a' + r + '_' + col} x={ox + col * c} y={oy + r * c} width={c - 2} height={c - 2}
                  fill="#f59e0b" fillOpacity={0.35 + 0.5 * (col / n)} stroke="#fff" strokeWidth="1" />
              );
            }
          }
          return cells;
        })()}
        <text x="98" y="262" fontSize="10" textAnchor="middle" fill="#64748b">causal attention matrix</text>

        <rect x="350" y="150" width="270" height="104" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="364" y="172" fontSize="11" fill="#7c3aed">Position tricks for long context</text>
        <text x="364" y="194" fontSize="10.5" fill="#6d28d9">RoPE — rotate each token vector</text>
        <text x="364" y="210" fontSize="10.5" fill="#6d28d9">by an angle set by its position</text>
        <text x="364" y="232" fontSize="10.5" fill="#6d28d9">ALiBi — gently penalize attention</text>
        <text x="364" y="248" fontSize="10.5" fill="#6d28d9">to far-away tokens</text>
      </svg>
    ),
  },

  /* ================= PART 5 ================= */
  {
    id: 21,
    part: 5,
    title: 'RAG — Retrieval-Augmented Generation',
    summary: `You'll understand how connecting a model to a searchable knowledge base cuts hallucination and adds fresh facts.`,
    explanation: `A model only knows what was in its training data, frozen at training time, so it can confidently invent facts it never actually learned. Retrieval-Augmented Generation (RAG) addresses this by letting the model look things up before answering. The user's question is first turned into an embedding vector and used to search a vector database of documents, which returns the passages most similar in meaning. Those retrieved passages are pasted into the prompt as context, so the model answers using real, relevant source text rather than memory alone. The result is more accurate, more current, and far easier to trace back to a citation.`,
    analogy: `It's the difference between answering from memory and answering with an open book. RAG hands the model the right pages from a reference library right before it responds, so it works from the source instead of guessing.`,
    concepts: [
      `LLMs hallucinate because their knowledge is frozen and incomplete.`,
      `RAG embeds the query and searches a vector database for similar passages.`,
      `Retrieved documents are added to the prompt as grounding context.`,
      `This yields more accurate, current, and citable answers.`,
    ],
    funFact: `RAG lets a model answer questions about documents written long after it was trained — its knowledge can be refreshed just by adding files to the database, no retraining required.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar21" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">Retrieve relevant text first, then generate a grounded answer</text>

        <rect x="20" y="52" width="80" height="34" rx="7" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="60" y="73" fontSize="11" textAnchor="middle" fill="#1e40af">query</text>
        <line x1="100" y1="69" x2="118" y2="69" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar21)" />

        <rect x="120" y="52" width="74" height="34" rx="7" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="157" y="73" fontSize="11" textAnchor="middle" fill="#6d28d9">embed</text>
        <line x1="194" y1="69" x2="212" y2="69" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar21)" />

        <ellipse cx="256" cy="52" rx="42" ry="8" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.4" />
        <path d="M214 52 L214 90 A42 8 0 0 0 298 90 L298 52" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" />
        <ellipse cx="256" cy="52" rx="42" ry="8" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="256" y="76" fontSize="10.5" textAnchor="middle" fill="#b45309">vector DB</text>
        <line x1="298" y1="70" x2="316" y2="70" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar21)" />

        <rect x="332" y="46" width="44" height="48" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.3" />
        <rect x="326" y="52" width="44" height="48" rx="4" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.3" />
        <rect x="320" y="58" width="44" height="48" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="342" y="86" fontSize="10" textAnchor="middle" fill="#1e40af">top-k</text>
        <text x="342" y="118" fontSize="9.5" textAnchor="middle" fill="#64748b">retrieved docs</text>

        <rect x="120" y="158" width="220" height="48" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="230" y="180" fontSize="11" textAnchor="middle" fill="#1e40af">augmented prompt</text>
        <text x="230" y="196" fontSize="10" textAnchor="middle" fill="#64748b">query + retrieved docs</text>

        <line x1="60" y1="86" x2="150" y2="156" stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#ar21)" />
        <line x1="342" y1="106" x2="300" y2="156" stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#ar21)" />

        <line x1="340" y1="182" x2="388" y2="182" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar21)" />
        <rect x="390" y="158" width="80" height="48" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.6" />
        <text x="430" y="186" fontSize="11" textAnchor="middle" fill="#6d28d9">LLM</text>

        <line x1="470" y1="182" x2="498" y2="182" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar21)" />
        <rect x="500" y="158" width="120" height="48" rx="8" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.6" />
        <text x="560" y="180" fontSize="11" textAnchor="middle" fill="#0f766e">grounded</text>
        <text x="560" y="196" fontSize="11" textAnchor="middle" fill="#0f766e">answer</text>
      </svg>
    ),
  },

  {
    id: 22,
    part: 5,
    title: 'AI Agents & Tool Use',
    summary: `You'll understand how an LLM becomes an agent that can reason, take actions with tools, and react to results.`,
    explanation: `On its own a model can only emit text, but wrapped in an agent loop it can actually get things done by using tools. The popular pattern is ReAct: the model writes a Thought about what to do, chooses an Action such as calling a tool, then receives an Observation — the tool's result — which it folds into its next Thought. Tools can be a web search, a code interpreter, a calculator, or any external API, vastly extending what the model can do beyond its frozen knowledge. The loop repeats, reasoning and acting in turns, until the model decides it has enough to give a final answer. This turns a text predictor into something that can plan, look things up, and operate software.`,
    analogy: `Picture a detective working a case. They form a hunch (Thought), follow a lead like interviewing a witness (Action), note what they learn (Observation), and update the theory — looping until the case is solved.`,
    concepts: [
      `An agent wraps an LLM in a loop so it can take actions, not just talk.`,
      `ReAct alternates Thought, Action, and Observation steps.`,
      `Tools include web search, code execution, calculators, and APIs.`,
      `The loop repeats until the model produces a final answer.`,
    ],
    funFact: `Giving a model a humble calculator can beat a vastly larger model at arithmetic — because doing math reliably and predicting the next token are genuinely different skills.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar22" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
          <marker id="ar22t" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#0d9488" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">The ReAct loop: think, act, observe, repeat</text>

        <rect x="250" y="44" width="150" height="40" rx="9" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.8" />
        <text x="325" y="69" fontSize="12" textAnchor="middle" fill="#6d28d9">Thought (reason)</text>

        <rect x="440" y="130" width="150" height="40" rx="9" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
        <text x="515" y="155" fontSize="12" textAnchor="middle" fill="#b45309">Action (call tool)</text>

        <rect x="60" y="130" width="150" height="40" rx="9" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.8" />
        <text x="135" y="155" fontSize="12" textAnchor="middle" fill="#1e40af">Observation</text>

        <path d="M390 84 C 450 104, 480 112, 506 128" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar22)" />
        <line x1="438" y1="158" x2="212" y2="158" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar22)" />
        <text x="325" y="152" fontSize="10" textAnchor="middle" fill="#64748b">tool result</text>
        <path d="M150 130 C 150 102, 200 88, 248 80" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar22)" />

        <rect x="448" y="40" width="152" height="34" rx="8" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.6" />
        <text x="524" y="62" fontSize="11" textAnchor="middle" fill="#0f766e">✔ final answer</text>
        <line x1="400" y1="60" x2="446" y2="58" stroke="#0d9488" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#ar22t)" />
        <text x="424" y="48" fontSize="9.5" textAnchor="middle" fill="#0f766e">when done</text>

        <line x1="515" y1="170" x2="515" y2="204" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar22)" />
        <text x="350" y="226" fontSize="10.5" fill="#64748b">tools:</text>
        <rect x="392" y="210" width="96" height="28" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
        <text x="440" y="228" fontSize="10.5" textAnchor="middle" fill="#475569">web search</text>
        <rect x="496" y="210" width="56" height="28" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
        <text x="524" y="228" fontSize="10.5" textAnchor="middle" fill="#475569">code</text>
        <rect x="560" y="210" width="52" height="28" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
        <text x="586" y="228" fontSize="10.5" textAnchor="middle" fill="#475569">API</text>
      </svg>
    ),
  },

  {
    id: 23,
    part: 5,
    title: 'Prompt Engineering',
    summary: `You'll understand how the way you structure a prompt can dramatically change the quality of a model's answer.`,
    explanation: `Because a model's only input is text, how you phrase and structure that text strongly shapes the output. Chat models read a stack of messages with roles: a system prompt sets overall behavior and rules, user turns carry requests, and assistant turns hold the model's replies. Two techniques reliably help: few-shot prompting includes a handful of worked examples so the model can copy the pattern, and chain-of-thought prompting asks it to reason step by step before answering. Chain-of-thought works because generating intermediate steps gives the model more room to compute, much like showing your work on a math problem. Small wording changes — clear instructions, explicit format requests, relevant context — often matter more than people expect.`,
    analogy: `It's like briefing a brilliant but very literal new hire. Set the ground rules up front (system prompt), show a couple of finished examples (few-shot), and ask them to talk through their reasoning (chain-of-thought) — and the work comes back far better.`,
    concepts: [
      `Chat prompts stack roles: system sets behavior, user asks, assistant replies.`,
      `Few-shot prompting supplies examples for the model to imitate.`,
      `Chain-of-thought asks the model to reason step by step.`,
      `Clear instructions and relevant context strongly improve results.`,
    ],
    funFact: `Simply adding "let's think step by step" was shown to boost reasoning accuracy on hard problems — a free upgrade that costs nothing but a few tokens.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar23" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">Structured prompts and step-by-step reasoning</text>

        <rect x="20" y="44" width="244" height="30" rx="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.4" />
        <text x="34" y="63" fontSize="10.5" fill="#475569">SYSTEM · you are a helpful assistant</text>
        <rect x="20" y="82" width="244" height="30" rx="7" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4" />
        <text x="34" y="101" fontSize="10.5" fill="#1e40af">USER · what is 17 × 24 ?</text>
        <rect x="20" y="120" width="244" height="30" rx="7" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.4" />
        <text x="34" y="139" fontSize="10.5" fill="#6d28d9">ASSISTANT · (reasons, then answers)</text>

        <text x="20" y="178" fontSize="10.5" fill="#64748b">few-shot examples:</text>
        <rect x="20" y="186" width="116" height="28" rx="6" fill="#fff" stroke="#cbd5e1" />
        <text x="78" y="204" fontSize="10.5" textAnchor="middle" fill="#475569">Q → A</text>
        <rect x="148" y="186" width="116" height="28" rx="6" fill="#fff" stroke="#cbd5e1" />
        <text x="206" y="204" fontSize="10.5" textAnchor="middle" fill="#475569">Q → A</text>

        <rect x="300" y="44" width="320" height="214" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="316" y="66" fontSize="11" fill="#6d28d9">chain-of-thought</text>
        <text x="316" y="90" fontSize="10.5" fill="#334155">"Let's think step by step."</text>
        <text x="316" y="120" fontSize="10.5" fill="#475569">17 × 24 = 17 × 20  +  17 × 4</text>
        <line x1="330" y1="132" x2="330" y2="146" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar23)" />
        <text x="316" y="166" fontSize="10.5" fill="#475569">= 340 + 68</text>
        <line x1="330" y1="178" x2="330" y2="192" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#ar23)" />
        <rect x="316" y="206" width="120" height="34" rx="7" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
        <text x="376" y="228" fontSize="12" textAnchor="middle" fill="#0f766e">Answer: 408</text>
        <text x="470" y="150" fontSize="10" fill="#94a3b8">showing the steps</text>
        <text x="470" y="166" fontSize="10" fill="#94a3b8">gives room to compute</text>
      </svg>
    ),
  },

  {
    id: 24,
    part: 5,
    title: 'Multimodal Models',
    summary: `You'll understand how models see images and hear audio by turning them into the same kind of tokens as text.`,
    explanation: `Language models only understand tokens, so to handle images or audio we convert those signals into tokens too. A Vision Transformer (ViT) chops an image into a grid of small fixed-size patches, flattens each patch into a vector, and treats that sequence of patch-vectors just like a sequence of word tokens. Audio is handled similarly: the waveform is sliced into short frames that become tokens. Crucially, all of these tokens are projected into one shared representation space, so the model can attend across text, image, and sound together. That shared space is what lets you show a picture and ask a question about it in the same prompt.`,
    analogy: `It's like translating every language into one common tongue before the conversation starts. Pictures, sounds, and words all get rewritten as the same kind of token, so the model can reason about them side by side without caring where each came from.`,
    concepts: [
      `Everything is converted into tokens the model can process uniformly.`,
      `A Vision Transformer splits an image into patches, each becoming a token.`,
      `Audio is sliced into short frames that also become tokens.`,
      `All modalities share one space, enabling cross-modal reasoning.`,
    ],
    funFact: `To a multimodal model a 16×16 image patch is just another "word" in its vocabulary of vectors — which is how it can describe a photo it has never seen before.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <defs>
          <marker id="ar24" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0 0 L7 3 L0 6 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x="20" y="20" fontSize="12" fill="#64748b">An image becomes patch tokens in a shared space with text</text>

        <rect x="28" y="58" width="110" height="110" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4" />
        <circle cx="112" cy="86" r="13" fill="#fbbf24" />
        <polygon points="36,166 78,104 120,166" fill="#14b8a6" />
        {[1, 2, 3].map((k) => (
          <g key={'grid' + k}>
            <line x1={28 + k * 27.5} y1="58" x2={28 + k * 27.5} y2="168" stroke="#fff" strokeWidth="1" opacity="0.8" />
            <line x1="28" y1={58 + k * 27.5} x2="138" y2={58 + k * 27.5} stroke="#fff" strokeWidth="1" opacity="0.8" />
          </g>
        ))}
        <text x="83" y="186" fontSize="10.5" textAnchor="middle" fill="#1e40af">image</text>

        <line x1="142" y1="113" x2="186" y2="113" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar24)" />
        <text x="164" y="104" fontSize="9.5" textAnchor="middle" fill="#64748b">patchify</text>

        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
          <rect key={'p' + r + '_' + c} x={194 + c * 17} y={70 + r * 17} width="15" height="15" rx="2"
            fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1" />
        )))}
        <text x="228" y="160" fontSize="10" textAnchor="middle" fill="#6d28d9">patch tokens</text>

        <line x1="266" y1="113" x2="312" y2="113" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#ar24)" />

        <rect x="320" y="58" width="300" height="150" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
        <text x="470" y="80" fontSize="11" textAnchor="middle" fill="#64748b">shared token space</text>
        {[0, 1, 2, 3].map((i) => (
          <g key={'imgtok' + i}>
            <rect x={340 + i * 38} y="96" width="32" height="24" rx="4" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.2" />
            <text x={356 + i * 38} y="112" fontSize="9" textAnchor="middle" fill="#6d28d9">img</text>
          </g>
        ))}
        {[{ t: 'What', x: 340, w: 48 }, { t: 'is', x: 392, w: 30 }, { t: 'this', x: 426, w: 40 }, { t: '?', x: 470, w: 24 }].map((d, i) => (
          <g key={'txt' + i}>
            <rect x={d.x} y="134" width={d.w} height="24" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2" />
            <text x={d.x + d.w / 2} y="150" fontSize="9.5" textAnchor="middle" fill="#1e40af">{d.t}</text>
          </g>
        ))}
        <text x="470" y="190" fontSize="10" textAnchor="middle" fill="#64748b">one Transformer attends across all tokens</text>
      </svg>
    ),
  },

  {
    id: 25,
    part: 5,
    title: "What LLMs Can't Do (Yet)",
    summary: `You'll understand the real, structural limits of today's models — what they genuinely cannot do, and why.`,
    explanation: `For all their fluency, current models have hard limits that come straight from how they work. They have no persistent memory: once a conversation scrolls out of the context window it is gone, and nothing carries to the next session unless a system deliberately stores it. They don't reason the way people do — they are extraordinary pattern-matchers, which can look like understanding but breaks down on truly novel problems. Hallucination is structural, not a bug: a model is built to produce the most plausible next token, and plausible is not the same as true, so it can state falsehoods with complete confidence. And everything must fit inside the finite context window, which acts as a small, lossy working memory. Knowing these boundaries is the key to using these tools wisely.`,
    analogy: `Imagine a phenomenally well-read improv actor with amnesia. They riff brilliantly on whatever is in front of them, but forget each scene the moment it ends, can't truly verify their lines, and will say something convincing whether or not it is actually true.`,
    concepts: [
      `No memory persists between sessions unless an external system stores it.`,
      `Pattern-matching mimics reasoning but falters on genuinely novel problems.`,
      `Hallucination is structural — plausible tokens are not always true ones.`,
      `The finite context window is a small, lossy working memory.`,
    ],
    funFact: `A model can ace an expert exam yet stumble on a child's riddle — fluency is not understanding, and benchmark scores can hide surprisingly brittle gaps.`,
    svg: (
      <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: SVG_FONT }}>
        <text x="20" y="20" fontSize="12" fill="#64748b">Three structural limits of today's models</text>

        {/* panel 1: no memory */}
        <text x="112" y="46" fontSize="11" textAnchor="middle" fill="#334155">no memory across sessions</text>
        <rect x="32" y="64" width="74" height="40" rx="7" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4" />
        <text x="69" y="88" fontSize="10" textAnchor="middle" fill="#1e40af">session 1</text>
        <rect x="120" y="64" width="74" height="40" rx="7" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.4" />
        <text x="157" y="88" fontSize="10" textAnchor="middle" fill="#94a3b8">session 2</text>
        <line x1="106" y1="84" x2="120" y2="84" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
        <line x1="108" y1="76" x2="118" y2="92" stroke="#ef4444" strokeWidth="2" />
        <line x1="118" y1="76" x2="108" y2="92" stroke="#ef4444" strokeWidth="2" />
        <text x="112" y="126" fontSize="9.5" textAnchor="middle" fill="#b91c1c">nothing carries over</text>

        {/* panel 2: hallucination */}
        <text x="320" y="46" fontSize="11" textAnchor="middle" fill="#334155">hallucination</text>
        <text x="238" y="74" fontSize="10" fill="#475569">Q · what is Earth's second moon?</text>
        <rect x="238" y="84" width="166" height="40" rx="7" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
        <text x="321" y="108" fontSize="10.5" textAnchor="middle" fill="#b91c1c">A · "It is called Luna II."</text>
        <text x="321" y="142" fontSize="9.5" textAnchor="middle" fill="#b91c1c">confident, fluent — and false</text>

        {/* panel 3: context as working memory */}
        <text x="528" y="46" fontSize="11" textAnchor="middle" fill="#334155">context = working memory</text>
        <rect x="448" y="92" width="160" height="92" rx="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.6" />
        <rect x="468" y="62" width="120" height="9" rx="3" fill="#e2e8f0" />
        <rect x="468" y="76" width="120" height="9" rx="3" fill="#e2e8f0" />
        <text x="528" y="56" fontSize="9" textAnchor="middle" fill="#94a3b8">older text forgotten</text>
        {[104, 122, 140, 158].map((y, i) => (
          <rect key={'ln' + i} x="464" y={y} width={[128, 118, 124, 96][i]} height="10" rx="3" fill="#cbd5e1" />
        ))}
        <text x="528" y="200" fontSize="9.5" textAnchor="middle" fill="#64748b">fixed-size, lossy buffer</text>
      </svg>
    ),
  },
];

export default function App() {
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [readChapters, setReadChapters] = useState(() => new Set([1]));
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedParts, setCollapsedParts] = useState(() => new Set());
  const contentRef = useRef(null);

  const current = CHAPTERS.find((c) => c.id === selectedChapter) || CHAPTERS[0];
  const meta = PART_META[current.part];

  const goTo = (id) => {
    setSelectedChapter(id);
    setReadChapters((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const idx = CHAPTERS.findIndex((c) => c.id === selectedChapter);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;

  const q = searchQuery.trim().toLowerCase();
  const matches = (c) =>
    !q || (c.title + ' ' + c.summary + ' ' + c.concepts.join(' ')).toLowerCase().includes(q);

  const togglePart = (p) => {
    setCollapsedParts((prev) => {
      const n = new Set(prev);
      if (n.has(p)) n.delete(p); else n.add(p);
      return n;
    });
  };

  const partIds = [1, 2, 3, 4, 5];
  const fontStack = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: fontStack, color: '#1e293b', background: '#ffffff' }}>
      {/* top bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            How AI &amp; LLMs Work
          </span>
          <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>From Token to Intelligence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 140, height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: (readChapters.size / CHAPTERS.length) * 100 + '%', height: '100%', background: '#0f766e', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 13, color: '#475569', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {readChapters.size} / {CHAPTERS.length} read
          </span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* sidebar */}
        <aside style={{ width: 250, flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fbfcfd' }}>
          <div style={{ padding: '14px 14px 10px' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 11px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#1e293b', fontFamily: fontStack }}
            />
          </div>
          <nav style={{ overflowY: 'auto', padding: '4px 8px 20px', flex: 1 }}>
            {partIds.map((p) => {
              const chs = CHAPTERS.filter((c) => c.part === p && matches(c));
              if (chs.length === 0) return null;
              const pm = PART_META[p];
              const isCollapsed = collapsedParts.has(p) && !q;
              return (
                <div key={'part' + p} style={{ marginBottom: 6 }}>
                  <button
                    onClick={() => togglePart(p)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: pm.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#64748b', flex: 1 }}>{pm.name}</span>
                    <span style={{ fontSize: 10, color: '#cbd5e1', transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
                  </button>
                  {!isCollapsed && chs.map((c) => {
                    const active = c.id === selectedChapter;
                    const isRead = readChapters.has(c.id);
                    return (
                      <button
                        key={'ch' + c.id}
                        data-concept-id={c.id}
                        onClick={() => goTo(c.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px 7px 14px',
                          background: active ? pm.tint : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                          borderLeft: active ? '3px solid ' + pm.color : '3px solid transparent', borderRadius: '0 6px 6px 0', marginBottom: 1,
                        }}
                      >
                        <span style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: active ? pm.color : '#94a3b8', width: 16, flexShrink: 0 }}>{c.id}</span>
                        <span style={{ fontSize: 13, lineHeight: 1.3, color: active ? '#0f172a' : '#475569', fontWeight: active ? 600 : 400, flex: 1 }}>{c.title}</span>
                        {isRead && <span style={{ fontSize: 10, color: active ? pm.color : '#cbd5e1', flexShrink: 0 }}>●</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {q && CHAPTERS.filter(matches).length === 0 && (
              <div style={{ padding: '16px 12px', fontSize: 13, color: '#94a3b8' }}>No chapters match “{searchQuery}”.</div>
            )}
          </nav>
        </aside>

        {/* main content */}
        <main ref={contentRef} style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px 80px' }}>
            {/* header with faded number */}
            <div style={{ position: 'relative', marginBottom: 26 }}>
              <span style={{ position: 'absolute', top: -34, right: -4, fontSize: 80, fontWeight: 800, color: meta.color, opacity: 0.06, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
                {current.id}
              </span>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: meta.color, background: meta.tint, padding: '5px 11px', borderRadius: 99 }}>
                {meta.label}
              </span>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '14px 0 0', lineHeight: 1.15, color: '#0f172a' }}>
                {current.title}
              </h1>
            </div>

            {/* what you'll learn */}
            <div style={{ background: meta.tint, border: '1px solid ' + meta.soft, borderRadius: 10, padding: '13px 16px', marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: meta.color, marginBottom: 4 }}>What you'll learn</div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: '#334155' }}>{current.summary}</div>
            </div>

            {/* explanation */}
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#334155', margin: '0 0 22px' }}>{current.explanation}</p>

            {/* analogy */}
            <blockquote style={{ margin: '0 0 30px', padding: '4px 0 4px 18px', borderLeft: '3px solid ' + meta.color, fontStyle: 'italic', fontSize: 15, lineHeight: 1.7, color: '#475569' }}>
              {current.analogy}
            </blockquote>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 26px' }} />

            {/* diagram card */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 20px 14px', marginBottom: 8, background: '#fff' }}>
              {current.svg}
            </div>
            <div style={{ fontSize: 12.5, color: '#94a3b8', textAlign: 'center', marginBottom: 32 }}>
              Figure {current.id} — {current.title}
            </div>

            {/* key concepts */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', marginBottom: 28, background: '#fbfcfd' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Key concepts</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {current.concepts.map((c, i) => (
                  <li key={'kc' + i} style={{ display: 'flex', gap: 11, marginBottom: i === current.concepts.length - 1 ? 0 : 10, fontSize: 14.5, lineHeight: 1.55, color: '#334155' }}>
                    <span style={{ color: meta.color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>▸</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* fun fact */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '15px 18px', marginBottom: 40, display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#b45309', marginBottom: 3 }}>Fun fact</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#78350f' }}>{current.funFact}</div>
              </div>
            </div>

            {/* nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
              {prev ? (
                <button onClick={() => goTo(prev.id)} style={navBtnStyle('left')}>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 2 }}>← Previous</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{prev.id}. {prev.title}</span>
                </button>
              ) : <span />}
              {next ? (
                <button onClick={() => goTo(next.id)} style={navBtnStyle('right')}>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Next →</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{next.id}. {next.title}</span>
                </button>
              ) : <span />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function navBtnStyle(align) {
  return {
    flex: 1,
    maxWidth: 320,
    textAlign: align === 'right' ? 'right' : 'left',
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
