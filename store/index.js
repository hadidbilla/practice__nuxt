import Vuex from "vuex";
import axios from "axios";
const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: [],
      token: null,
    },
    mutations: {
      setPosts(state, payload) {
        state.loadedPosts = payload;
      },

      addPosts(state, payload) {
        state.loadedPosts.push(payload);
      },

      editPosts(state, payload) {
        const postIndex = state.loadedPosts.findIndex(
          (post) => post.id === payload.id
        );
        state.loadedPosts[postIndex] = payload;
      },
      setToken(state, token) {
        state.token = token;
      },
    },
    actions: {
      nuxtServerInit(vuexContext, context) {
        return axios
          .get("https://nuxt-maxi-default-rtdb.firebaseio.com/posts.json")
          .then((response) => {
            const postData = [];
            for (const key in response.data) {
              postData.push({ ...response.data[key], id: key });
              // console.log(response.data[key], ",id:" + key);
            }
            vuexContext.commit("setPosts", postData);
          })
          .catch((error) => console.log(error));
      },
      setPosts(context, payload) {
        context.commit("setPosts", payload);
      },
      addPost(vuexContext, post) {
        const createdPost = {
          ...post,
          updatedDate: new Date(),
        };
        return axios
          .post(
            "https://nuxt-maxi-default-rtdb.firebaseio.com/posts.json",
            createdPost
          )
          .then((result) => {
            vuexContext.commit("addPost", {
              ...createdPost,
              id: result.data.name,
            });
          })
          .catch((e) => console.log(e));
      },
      editPost(vuexContext, editedPost) {
        return axios
          .put(
            "https://nuxt-maxi-default-rtdb.firebaseio.com/posts/" +
              editedPost.id +
              ".json",
            editedPost
          )
          .then((res) => {
            vuexContext.commit("editPost", editedPost);
          })
          .catch((e) => console.log(e));
      },
      authenticateUser(vuexContext, payload) {
        let authUrl =
          "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDmf4ITxnxPU17lMSXFLRTkiMTsDoMkUV8";
        if (!payload.isLogin) {
          authUrl =
            "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDmf4ITxnxPU17lMSXFLRTkiMTsDoMkUV8";
        }
        return axios
          .post(authUrl, {
            email: payload.email,
            password: payload.password,
            returnSecureToken: true,
          })
          .then((res) => {
            vuexContext.commit("setToken", res.data.kind);
          })
          .catch((err) => console.log(err));
      },
    },

    getters: {
      loadedPosts(state) {
        return state.loadedPosts;
      },
      isLogin(state) {
        return state.token;
      },
    },
  });
};
export default createStore;
