import querystring from "querystring";
import { v4 as uuid } from "uuid";

const ls = window.localStorage;
ls.setItem("oauth_state", uuid());

export default function Authorize() {
  return <div>AUTHORIZE?</div>;
}
