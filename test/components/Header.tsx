
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-5 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
          <i className="fa-solid fa-vial-circle-check mr-2"></i>
          ドイツ語の名詞ジェンダーpHメーター
        </h1>
        <p className="text-center text-slate-500 mt-2">
            入力した文章のドイツ語訳に含まれる名詞の男女バランスをpHスケールで可視化します。
        </p>
      </div>
    </header>
  );
};

export default Header;
