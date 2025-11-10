/// <reference types="react-scripts" />

declare module 'chessboardjsx' {
  import { Component } from 'react';
  
  interface ChessboardProps {
    position?: string;
    onDrop?: (arg: { sourceSquare: string; targetSquare: string }) => void;
    width?: number;
    boardStyle?: React.CSSProperties;
    darkSquareStyle?: React.CSSProperties;
    lightSquareStyle?: React.CSSProperties;
    draggable?: boolean;
    orientation?: 'white' | 'black';
    [key: string]: any;
  }
  
  export default class Chessboard extends Component<ChessboardProps> {}
}
