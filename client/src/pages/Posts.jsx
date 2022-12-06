import React, {useEffect} from "react";
import {useState} from "react";
import {usePosts} from "../hooks/usePosts";
import {useFetching} from "../hooks/useFetching";
import PostService, {BASE_URL} from "../API/PostService";
import {getPageCount} from "../utils/pages";
import MyButton from "../components/UI/button/MyButton";
import MyModal from "../components/UI/modal/MyModal";
import PostForm from "../components/PostForm";
import PostFilter from "../components/PostFilter";
import PostList from "../components/PostList";
import Pagination from "../components/UI/pagination/Pagination";
import Loader from "../components/UI/loader/Loader";
import {Link} from "react-router-dom";

function Posts() {

  // получение авторизации
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  useEffect(() =>{
    const userRequest = async () => {
      setResult("")
      setError("")
      try {
        const response = await fetch(`${BASE_URL}/auth`, {
          credentials: "include",
          method: "GET"
        })
        if (response.status !== 200) {
          const responseData = await response.json()
          throw Error(responseData.message)
        }
        const user = await response.json()
        setResult(`welcome home, ${user.login}`)
      } catch (e) {
        if(e instanceof Error) {
          setError(e.message)
        }
      }
    }
    userRequest()
  })

  // загрузка постов
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({sort: '', query: ''})
  const [modal, setModal] = useState(false)

  const [totalPages, setTotalPages] = useState(0)
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)

  const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query);

  const [fetchPosts, isPostsLoading, postError] = useFetching(async (limit, page) => {
    const response = await PostService.getAll(limit, page)
    setPosts(response.data)
    const totalCount = response.headers['x-total-count']
    setTotalPages(getPageCount(totalCount, limit))
  })

  useEffect(() => {
    fetchPosts(limit, page)
  }, [])


  const createPost = (newPost) => {
    setPosts([...posts, newPost])
    setModal(false)
  }

  const removePost = (post) => {
    setPosts(posts.filter(p => p.id !== post.id))
  }

  const changePage = (page) => {
    setPage(page)
    fetchPosts(limit, page)
  }

  return <>
    {result && <>{result}</>}
    {error && <>{error}</>}
      <div className="App">
        <Link to="/login">Выйти</Link>
        <br/>
        <MyButton style={{marginTop: 30}} onClick={() => setModal(true)}>
          Create post
        </MyButton>

        <MyModal visible={modal} setVisible={setModal}>
          <PostForm create={createPost}/>
        </MyModal>

        <hr style={{margin: '15px 0'}}/>
        <PostFilter
            filter={filter}
            setFilter={setFilter}
        />
        {postError && <h2>Error ${postError}</h2>}
        {isPostsLoading
            ? <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}><Loader /></div>
            : <PostList remove={removePost} posts={sortedAndSearchedPosts} title="forum"/>
        }

        <Pagination page={page} changePage={changePage} totalPages={totalPages}/>
      </div>
  </>
}

export default Posts;