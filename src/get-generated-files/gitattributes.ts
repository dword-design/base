import endent from 'endent';

export default endent`
  * text=auto eol=lf
  *.glb filter=lfs diff=lfs merge=lfs -text
  *.jpg filter=lfs diff=lfs merge=lfs -text
  *.png filter=lfs diff=lfs merge=lfs -text
  *.vsix filter=lfs diff=lfs merge=lfs -text

`;
