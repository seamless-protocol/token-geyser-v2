import { useState } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'

const Banner = () => {
  const [showBanner, setShowBanner] = useState(false)

  return (
    <>
      {showBanner ? (
        <BannerContainer>
          <TextContainer>
            <p>
              <b>Staking Farms will be temporarily inactive starting November 8th.</b> If your are currently using the
              Staking Farms, you will need to unstake and withdraw your position on November 8th to continue earning OG
              points. Learn more about how to unstake/withdraw{' '}
              <a
                href="https://seamlessprotocol.medium.com/unstaking-withdrawing-on-seamless-protocol-a-step-by-step-guide-e25e72d2b73b"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </TextContainer>
          <button onClick={() => setShowBanner(false)}>
            <CloseImage
              src="/assests/close.svg"
              alt="close banner icon"
              width={20}
              height={20}
              className="absolute right-2 top-3 sm:right-6 sm:top-3"
            />
          </button>
        </BannerContainer>
      ) : null}
    </>
  )
}

export default Banner

const BannerContainer = styled.div`
  ${tw`flex w-full items-center justify-center gap-1 bg-[#FABC45] p-4 text-black sm:p-3`}
`

const TextContainer = styled.div`
  ${tw`md:text-md text-xs sm:text-sm`}
`

const CloseImage = styled.img`
  ${tw`absolute right-2 top-3 sm:right-6 sm:top-3`}
`
