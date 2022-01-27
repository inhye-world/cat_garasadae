import logo from './logo.svg';
import React from 'react';
import Title from "./components/Title";
import './App.css';

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
  return JSON.parse(localStorage.getItem(key));
  },
  };

  const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
  };

  const CatScript = ({updateMainCat}) => {
    const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
    const [value, setValue] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    function handleInputChange(e){
      const userValue = e.target.value;
      setErrorMessage('');
      if(includesHangul(userValue)){
        setErrorMessage('한글은 입력할 수 없습니다.');
        return;
      }
      setValue(userValue.toUpperCase());
    }

    function handleFormSubmit(e){
      e.preventDefault();
      setErrorMessage('');
      if(value === ''){
        setErrorMessage('빈 값으로 만들 수 없습니다.');
      }

      updateMainCat(value);
    }

    return (
      <form onSubmit={handleFormSubmit}>
        <input 
          type="text"
          name="name"
          placeholder="영어 대사를 입력해주세요"
          value={value}
          onChange={handleInputChange}
        />
        <button type="submit">생성</button>
        <p style={{color:"red"}}>{errorMessage}</p>
      </form>
    )
  };

  function CatItem(props){
    return(
      <li>
        <img src={props.img} style={{width: "150px"}}/>
      </li>
    )
  }

  function Favorites({favorites}){
    if(favorites.length === 0){
      return <div> 사진 위 하트를 눌러 고양이 사진을 저장해봐요!</div>
    }

    return (
      <ul className="favorites">
        {favorites.map((cat) => (
          <CatItem img={cat} key={cat}/>
        ))}
    </ul>
    )
  }

  const MainCard = ({img, onHeartClick, alreadyFavorite}) => {
    const heartIcon = alreadyFavorite ? "💖" : "🤍";

    return(
      <div className="main-card">
      <img src={img} alt="고양이" width="400"/>
      <button onClick={onHeartClick}>{heartIcon}</button>
    </div>
    )
  }

  const App = () => {
    const CAT1 = "https://cataas.com/cat/60b73094e04e18001194a309/says/react";
    const CAT2 = "https://cataas.com//cat/5e9970351b7a400011744233/says/inflearn";
    const CAT3 = "https://cataas.com/cat/595f280b557291a9750ebf65/says/JavaScript";

    const defaultTitle = "고양이 가라사대";

    const [counter, setCounter] = React.useState(() => {
      return jsonLocalStorage.getItem('counter')
    })//불필요하게 local storage에 접근하지 않을 수 있다.

    const [imgUrl, setImgUrl] = React.useState(CAT1);
    const [favorites, setFavorites] = React.useState(() => {
      return jsonLocalStorage.getItem('favorites') || []
    });// 앞의 내용이 없으면 뒤의 내용을 써라

    const alreadyFavorite = favorites.includes(imgUrl)


    //앱 진입시에 바로 api를 콜해서 api 데이터를 mainCat으로 갈아주는 작업
    async function setInitialCat(){
      const newCat = await fetchCat('First cat');
      console.log(newCat);      
      setImgUrl(newCat);
    }

    
    React.useEffect(() => {
      setInitialCat();
    }, []);

    async function updateMainCat(value){
      const newCat = await fetchCat(value);

      setImgUrl(newCat);
      
      //setCounter(nextCounter);
      setCounter((prev) => {//counter랑 setcounter는 서로 바라보는 곳이 달라서 빠르게 연타하면 미스매치가 일어난다
        //그래서 아예 이전 값을 넘겨줘서 직접적으로 +1을 하도록 수정한다.
        const nextCounter = prev + 1;
        jsonLocalStorage.setItem('counter', nextCounter);
        return nextCounter;
      })
    }

    function handleHeartClick(){
      const nextFavorites = [...favorites, imgUrl]
      setFavorites(nextFavorites);
      jsonLocalStorage.setItem('favorites', nextFavorites)
    }

    const counterTitle = counter === null ? "" : counter+"번째 ";

    return(
      <div>
      <Title> {counterTitle} 고양이 가라사대</Title>
      <CatScript updateMainCat={updateMainCat}/>
      <MainCard img={imgUrl} onHeartClick={handleHeartClick} alreadyFavorite={alreadyFavorite}/>
      <Favorites favorites={favorites}/>
    </div>
    )//props으로 넘길 땐 handle이 아닌 on을 쓴다.
  } 

export default App;
