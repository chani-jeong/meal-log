// 로그인한 사용자의 닉네임과 프로필 사진을 보여 줍니다. user가 없으면 아무것도 그리지 않습니다.
export default function UserBadge({ user }) {
  if (!user) return null;
  const name = user.displayName || '사용자';
  return (
    <div className="user-badge">
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="avatar-img" />
      ) : (
        <span className="avatar">{name.charAt(0)}</span>
      )}
      <span className="user-name">{name}</span>
    </div>
  );
}