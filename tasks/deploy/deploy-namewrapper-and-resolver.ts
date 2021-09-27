import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployer, logHre } from '../../evm-utils';
import {
  BaseRegistrarImplementation__factory,
  ENS__factory,
  PublicResolver__factory,
  NameWrapper__factory,
} from '../../types';

task('deploy-name-wrapper-and-resolver')
  .addFlag('verify', 'Verify Etherscan Contract')
  .addParam('ens', 'ens')
  .addParam('ethRegistrar', 'ethRegistrar')
  .setAction(async ({ ens, ethRegistrar }, hre: HardhatRuntimeEnvironment) => {
    await logHre(hre);
    const deployer = await getDeployer(hre, true);

    const registrar = BaseRegistrarImplementation__factory.connect(
      ethRegistrar,
      deployer
    );
    const registry = ENS__factory.connect(ens, deployer);

    const newNameWrapper = await hre.deployments.deploy('NameWrapper', {
      from: deployer.address,
      args: [
        registry.address,
        registrar.address,
        hre.ethers.constants.AddressZero,
      ],
    });
    const nameWrapper = NameWrapper__factory.connect(
      newNameWrapper.address,
      deployer
    );

    const newPublicResolver = await hre.deployments.deploy('PublicResolver', {
      from: deployer.address,
      args: [registry.address, nameWrapper.address],
    });
    const publicResolver = PublicResolver__factory.connect(
      newPublicResolver.address,
      deployer
    );

    console.log(
      `Deployed by ${deployer.address}. nameWrapper ${nameWrapper.address}`
    );
    console.log(
      `Deployed by ${deployer.address}. nameWrapper ${publicResolver.address}`
    );
    return { nameWrapper, publicResolver };
  });
