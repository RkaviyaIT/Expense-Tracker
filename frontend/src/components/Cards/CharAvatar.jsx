import React from 'react'

const getInitials = (fullName) => {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const CharAvatar = ( {fullName,width,height,style}) => {
  return <div className={`${width || 'w-12'} ${height||'h-12'} ${style || ''} flex items-center justify-center rounded-full text-gray-900 font-medium bg-gray-100`}>
    {getInitials(fullName || "")}
    </div>
}

export default CharAvatar