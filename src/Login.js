import querystring from "querystring";
import { v4 as uuid } from "uuid";

const ls = window.localStorage;
ls.setItem("oauth_state", uuid());

const scope = [
  "history",
  "identity",
  "mysubreddits",
  "read",
  "report",
  "save",
  "submit",
  "subscribe",
  "vote",
  "wikiread"
];

function getAuthenticationUrl() {
  return `https://www.reddit.com/api/v1/authorize?${querystring.stringify({
    client_id: "mh7mdzhTLvpoIg",
    response_type: "code",
    state: ls.getItem("oauth_state"),
    redirect_uri: "https://pmzz9.csb.app/authorize",
    duration: "permanent",
    scope: scope.join(" ")
  })}`;
}

export default function Login() {
  return (
    <div>
      <a href={getAuthenticationUrl()}>Login with Reddit</a>
    </div>
  );
}
